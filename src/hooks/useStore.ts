import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_TIMER, LADDER } from '../config/options';
import { getExercise, PREMADE_TEMPLATES } from '../services/data';
import { Exercise, Filters, HistoryEntry, Level, Location, Template, TemplateExercise, User } from '../types';
import { EMPTY_FILTERS } from '../utils/filters';
import { newId } from '../utils/format';
import { estimateMinutes } from '../utils/timerEngine';

// Local-first storage: everything below is persisted with AsyncStorage
// (localStorage on the web). The shape mirrors the Firestore collections in
// the brief so a Firebase sync layer can be added without changing screens.
interface State {
  hasHydrated: boolean;
  user: User | null;
  savedWorkouts: Template[];
  history: HistoryEntry[];
  filters: Filters;
  muted: boolean;
  // Workout currently being edited or built from scratch.
  draft: Template | null;

  signIn: (displayName: string, email: string) => void;
  continueAsGuest: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'display_name' | 'level' | 'preferred_location'>>) => void;
  setFilters: (filters: Filters) => void;
  setMuted: (muted: boolean) => void;

  saveWorkout: (t: Template) => string;
  deleteWorkout: (id: string) => void;
  addHistory: (entry: Omit<HistoryEntry, 'id' | 'user_id' | 'completed_at'>) => void;
  clearHistory: () => void;

  startDraftFrom: (t: Template | null) => void;
  updateDraft: (patch: Partial<Template>) => void;
  addExercise: (exercise: Exercise) => void;
  swapExercise: (index: number, exercise: Exercise) => void;
  removeExercise: (index: number) => void;
  moveExercise: (index: number, delta: -1 | 1) => void;
  updateExercise: (index: number, patch: Partial<TemplateExercise>) => void;
}

function makeUser(displayName: string, email: string | null, isGuest: boolean): User {
  return {
    id: newId(),
    email,
    display_name: displayName,
    is_guest: isGuest,
    level: 'beginner' as Level,
    preferred_location: 'home' as Location,
    created_at: new Date().toISOString(),
  };
}

function blankWorkout(userId: string | null): Template {
  return {
    id: '',
    name: 'My Workout',
    direction: 'full_body',
    structure: 'rounds',
    level: 'beginner',
    location: 'home',
    equipment: ['none'],
    is_premade: false,
    created_by: userId,
    ...DEFAULT_TIMER,
    total_time_minutes: 0,
    exercise_list: [],
    created_at: new Date().toISOString(),
  };
}

function toItem(exercise: Exercise, order: number, structure: Template['structure']): TemplateExercise {
  return {
    exercise_id: exercise.id,
    order,
    reps: structure === 'ladder' ? null : exercise.reps_default,
    duration: structure === 'ladder' ? null : exercise.duration_default,
    ...(structure === 'ladder' ? { ladder: LADDER } : {}),
  };
}

function renumber(list: TemplateExercise[]): TemplateExercise[] {
  return list.map((item, i) => ({ ...item, order: i + 1 }));
}

// Recompute the fields that depend on the exercise list or timer settings.
function derive(t: Template): Template {
  const gear = [...new Set(t.exercise_list.flatMap((i) => getExercise(i.exercise_id)?.equipment ?? []))];
  const equipment = gear.length > 1 ? gear.filter((g) => g !== 'none') : gear.length ? gear : ['none' as const];
  const total_time_minutes = t.structure === 'amrap' ? t.total_time_minutes || 15 : estimateMinutes(t);
  return { ...t, equipment: equipment.sort(), total_time_minutes };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      user: null,
      savedWorkouts: [],
      history: [],
      filters: EMPTY_FILTERS,
      muted: false,
      draft: null,

      signIn: (displayName, email) =>
        set({ user: makeUser(displayName.trim() || email.split('@')[0], email.trim(), false) }),
      continueAsGuest: () => set({ user: makeUser('Guest', null, true) }),
      logout: () => set({ user: null, draft: null }),
      updateProfile: (patch) => {
        const user = get().user;
        if (user) set({ user: { ...user, ...patch } });
      },
      setFilters: (filters) => set({ filters }),
      setMuted: (muted) => set({ muted }),

      saveWorkout: (t) => {
        const user = get().user;
        const isNew = !t.id || t.is_premade;
        const saved: Template = derive({
          ...t,
          id: isNew ? newId() : t.id,
          slug: undefined,
          is_premade: false,
          created_by: user?.id ?? null,
          created_at: isNew ? new Date().toISOString() : t.created_at,
        });
        set((s) => ({
          savedWorkouts: isNew
            ? [saved, ...s.savedWorkouts]
            : s.savedWorkouts.map((w) => (w.id === saved.id ? saved : w)),
        }));
        return saved.id;
      },
      deleteWorkout: (id) => set((s) => ({ savedWorkouts: s.savedWorkouts.filter((w) => w.id !== id) })),

      addHistory: (entry) => {
        const now = new Date().toISOString();
        set((s) => ({
          history: [{ ...entry, id: newId(), user_id: s.user?.id ?? 'guest', completed_at: now }, ...s.history],
          savedWorkouts: s.savedWorkouts.map((w) => (w.id === entry.template_id ? { ...w, last_used_at: now } : w)),
        }));
      },
      clearHistory: () => set({ history: [] }),

      startDraftFrom: (t) => set({ draft: t ? { ...t, exercise_list: [...t.exercise_list] } : blankWorkout(get().user?.id ?? null) }),
      updateDraft: (patch) => {
        const draft = get().draft;
        if (!draft) return;
        let next = { ...draft, ...patch };
        // Switching structure applies that structure's standard timing.
        if (patch.structure && patch.structure !== draft.structure) {
          next = applyStructureDefaults(next);
        }
        set({ draft: derive(next) });
      },
      addExercise: (exercise) => {
        const draft = get().draft;
        if (!draft) return;
        const list = [...draft.exercise_list, toItem(exercise, draft.exercise_list.length + 1, draft.structure)];
        set({ draft: derive({ ...draft, exercise_list: list }) });
      },
      swapExercise: (index, exercise) => {
        const draft = get().draft;
        if (!draft) return;
        const list = draft.exercise_list.map((item, i) =>
          i === index ? toItem(exercise, item.order, draft.structure) : item,
        );
        set({ draft: derive({ ...draft, exercise_list: list }) });
      },
      removeExercise: (index) => {
        const draft = get().draft;
        if (!draft) return;
        const list = renumber(draft.exercise_list.filter((_, i) => i !== index));
        set({ draft: derive({ ...draft, exercise_list: list }) });
      },
      moveExercise: (index, delta) => {
        const draft = get().draft;
        const target = index + delta;
        if (!draft || target < 0 || target >= draft.exercise_list.length) return;
        const list = [...draft.exercise_list];
        [list[index], list[target]] = [list[target], list[index]];
        set({ draft: derive({ ...draft, exercise_list: renumber(list) }) });
      },
      updateExercise: (index, patch) => {
        const draft = get().draft;
        if (!draft) return;
        const list = draft.exercise_list.map((item, i) => (i === index ? { ...item, ...patch } : item));
        set({ draft: derive({ ...draft, exercise_list: list }) });
      },
    }),
    {
      name: 'workout-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ user, savedWorkouts, history, filters, muted }) => ({
        user,
        savedWorkouts,
        history,
        filters,
        muted,
      }),
      onRehydrateStorage: () => () => useStore.setState({ hasHydrated: true }),
    },
  ),
);

function applyStructureDefaults(t: Template): Template {
  const list = (ladder: boolean) =>
    t.exercise_list.map((item) => {
      const ex = getExercise(item.exercise_id);
      return ladder
        ? { ...item, reps: null, duration: null, ladder: LADDER }
        : { exercise_id: item.exercise_id, order: item.order, reps: ex?.reps_default ?? null, duration: ex?.duration_default ?? null };
    });

  switch (t.structure) {
    case 'tabata':
      return { ...t, work_seconds: 20, rest_exercise_seconds: 10, rest_round_seconds: 10, rounds: 8, exercise_list: list(false) };
    case 'emom':
      return { ...t, work_seconds: 60, rest_exercise_seconds: 0, rest_round_seconds: 0, rounds: 5, exercise_list: list(false) };
    case 'amrap':
      return { ...t, work_seconds: 0, rest_exercise_seconds: 0, rest_round_seconds: 0, rounds: 0, total_time_minutes: 15, exercise_list: list(false) };
    case 'ladder':
      return { ...t, work_seconds: 0, rest_exercise_seconds: 15, rest_round_seconds: 60, rounds: 1, exercise_list: list(true) };
    default:
      return { ...t, ...DEFAULT_TIMER, exercise_list: list(false) };
  }
}

export function useTemplate(id: string | undefined): Template | undefined {
  const saved = useStore((s) => s.savedWorkouts.find((t) => t.id === id));
  return saved ?? PREMADE_TEMPLATES.find((t) => t.id === id);
}
