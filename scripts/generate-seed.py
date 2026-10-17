#!/usr/bin/env python3
"""Generate seed/exercises.json and seed/templates.json.

Usage: python3 scripts/generate-seed.py seed
"""
import json, uuid, re, os, sys
NS = uuid.UUID("6c63ff00-d4aa-4a0a-8a0a-0a0a0a0a0a0a")
CREATED = "2026-10-17T00:00:00Z"
out = sys.argv[1]

def slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
def uid(kind, s): return str(uuid.uuid5(NS, f"{kind}:{slug(s)}"))

LOC = {"none":["home","gym","anywhere"],"wall":["home","gym","anywhere"],"band":["home","gym","anywhere"],
       "chair":["home"],"table":["home"],"towel":["home"],"bar":["home","gym"],
       "dumbbells":["home","gym"],"machine":["gym"]}

# name, equipment, level, reps-spec, directions, muscles, description
E = [
# LEGS
("Squats","none","beginner","15",["legs","lower"],["quadriceps","glutes","hamstrings"],"Feet shoulder-width apart, sit hips back and down until thighs are parallel, then drive up through the heels."),
("Lunges","none","beginner","12/side",["legs","lower"],["quadriceps","glutes"],"Step forward and lower until both knees are at 90 degrees, then push back to standing. Alternate legs."),
("Glute Bridges","none","beginner","15",["legs","lower"],["glutes","hamstrings"],"Lie on your back, knees bent, and drive your hips up until your body forms a straight line from shoulders to knees."),
("Calf Raises","none","beginner","20",["legs","lower"],["calves"],"Rise onto the balls of your feet as high as possible, pause, then lower slowly."),
("Wall Sit","none","beginner","30s",["legs","lower"],["quadriceps","glutes"],"Back flat against a wall, slide down until knees are at 90 degrees and hold."),
("Step-ups","chair","beginner","12/side",["legs","lower"],["quadriceps","glutes"],"Step onto a sturdy chair with one foot, drive up to standing, then step down with control."),
("Box Squats","chair","beginner","15",["legs","lower"],["quadriceps","glutes"],"Squat back until you lightly touch the chair seat, then stand up without bouncing."),
("Jump Squats","none","intermediate","12",["legs","lower","full_body"],["quadriceps","glutes","calves"],"Squat down, then explode upward into a jump. Land softly and go straight into the next rep."),
("Bulgarian Split Squats","chair","intermediate","10/side",["legs","lower"],["quadriceps","glutes"],"Rear foot on a chair behind you, lower the back knee toward the floor, then drive up through the front heel."),
("Single-leg Glute Bridge","none","intermediate","12/side",["legs","lower"],["glutes","hamstrings"],"Glute bridge with one leg extended in the air. Keep the hips level throughout."),
("Side Lunges","none","intermediate","10/side",["legs","lower"],["adductors","quadriceps","glutes"],"Step wide to the side, sit back into that hip keeping the other leg straight, then push back to center."),
("Curtsy Lunges","none","intermediate","10/side",["legs","lower"],["glutes","quadriceps"],"Step one leg diagonally behind the other and lower into a lunge, then return to standing."),
("Assisted Pistol Squat","chair","intermediate","8/side",["legs","lower"],["quadriceps","glutes"],"Holding a chair for balance, lower on one leg with the other leg extended forward, then stand up."),
("Pistol Squat Negative","none","advanced","6/side",["legs","lower"],["quadriceps","glutes","core"],"Lower slowly on one leg (3-5 seconds) to the bottom of a pistol squat, then use both legs to stand."),
("Nordic Curl Negative","none","advanced","6",["legs","lower"],["hamstrings"],"Kneel with ankles anchored, lower your torso toward the floor as slowly as possible, then push back up with your hands."),
# PUSH
("Knee Push-ups","none","beginner","15",["push","upper"],["chest","triceps","shoulders"],"Push-up from the knees, keeping a straight line from head to knees."),
("Incline Push-ups","chair","beginner","12",["push","upper"],["chest","triceps","shoulders"],"Hands on a chair seat, body straight, lower your chest to the edge and press back up."),
("Push-ups","none","beginner","10",["push","upper"],["chest","triceps","shoulders","core"],"Hands under shoulders, body in a straight line, lower chest to the floor and press up."),
("Wide Push-ups","none","beginner","12",["push","upper"],["chest","shoulders"],"Push-up with hands wider than shoulder-width to emphasise the chest."),
("Tricep Dips","chair","beginner","12",["push","upper"],["triceps","shoulders"],"Hands on the edge of a chair behind you, bend elbows to lower your hips, then press back up."),
("Diamond Push-ups","none","intermediate","10",["push","upper"],["triceps","chest"],"Push-up with hands together under the chest, thumbs and index fingers forming a diamond."),
("Pike Push-ups","none","intermediate","10",["push","upper"],["shoulders","triceps"],"Hips high in an inverted V, bend elbows to bring your head toward the floor, then press up."),
("Decline Push-ups","chair","intermediate","10",["push","upper"],["chest","shoulders","triceps"],"Feet on a chair, hands on the floor, perform a push-up keeping the body straight."),
("Hindu Push-ups","none","intermediate","10",["push","upper"],["shoulders","chest","triceps"],"From downward dog, swoop the chest down and forward into upward dog, then push back."),
("Archer Push-ups","none","advanced","6/side",["push","upper"],["chest","triceps","shoulders"],"Wide hand position, shift your weight to one arm while the other stays straight."),
("Clapping Push-ups","none","advanced","8",["push","upper"],["chest","triceps"],"Explode up from the bottom of a push-up, clap, and land with soft elbows."),
("Finger Push-ups","none","advanced","5",["push","upper"],["chest","triceps","forearms"],"Push-up supported on the fingertips. Progress slowly to protect the fingers."),
("Pseudo Planche Push-ups","none","advanced","8",["push","upper"],["shoulders","chest","core"],"Hands turned out by the hips, lean forward past the hands and perform push-ups."),
("Chest Press","machine","beginner","12",["push","upper"],["chest","triceps","shoulders"],"Seated chest press machine: press the handles forward until arms are extended, return with control."),
# PULL
("Band Pull-aparts","band","beginner","15",["pull","upper"],["rear_delts","upper_back"],"Hold a band at shoulder height with straight arms and pull it apart until it touches your chest."),
("Face Pulls","band","beginner","15",["pull","upper"],["rear_delts","upper_back"],"Anchor a band at face height and pull toward your forehead, elbows high and wide."),
("Inverted Rows","table","beginner","10",["pull","upper"],["lats","upper_back","biceps"],"Lie under a sturdy table, grip the edge and pull your chest up to it with a straight body."),
("Floor Pull-throughs","none","beginner","12",["pull","upper"],["lats","upper_back"],"Lying face down, slide your arms from overhead down to your hips while squeezing the shoulder blades."),
("Superman Holds","none","beginner","20s",["pull","upper"],["lower_back","glutes","upper_back"],"Lie face down and lift arms, chest and legs off the floor. Hold."),
("Chin-ups","bar","intermediate","6",["pull","upper"],["lats","biceps"],"Underhand grip, pull until your chin passes the bar, lower with control."),
("Australian Pull-ups","bar","intermediate","8",["pull","upper"],["upper_back","lats","biceps"],"With a bar at waist height, hang underneath and pull your chest to the bar."),
("Towel Rows","towel","intermediate","10",["pull","upper"],["upper_back","lats","biceps"],"Loop a towel around a closed door handle, lean back and row your body toward the door."),
("Negative Pull-ups","bar","intermediate","5",["pull","upper"],["lats","biceps"],"Jump to the top of a pull-up and lower yourself as slowly as possible (3-5 seconds)."),
("Pull-ups","bar","advanced","5",["pull","upper"],["lats","biceps","upper_back"],"Overhand grip, pull until your chin clears the bar, lower to a full hang."),
("Commando Pull-ups","bar","advanced","6",["pull","upper"],["lats","biceps","core"],"Grip the bar with hands in line, pull your head to alternate sides of the bar."),
("Wide Grip Pull-ups","bar","advanced","5",["pull","upper"],["lats","upper_back"],"Pull-up with hands well outside shoulder-width."),
# CORE
("Plank","none","beginner","30s",["core"],["abs","core"],"Forearms under shoulders, body in a straight line. Brace and hold."),
("Hollow Body Hold","none","beginner","20s",["core"],["abs"],"Lower back pressed into the floor, lift shoulders and legs and hold a banana shape."),
("Bicycle Crunches","none","beginner","20",["core"],["abs","obliques"],"Bring opposite elbow to knee while extending the other leg, alternating sides."),
("Flutter Kicks","none","beginner","20",["core"],["abs","hip_flexors"],"Lying on your back, legs raised a few inches, kick them up and down in small motions."),
("Mountain Climbers","none","beginner","20",["core","full_body"],["core","shoulders","hip_flexors"],"In a high plank, drive knees toward the chest one at a time, quickly."),
("Dead Bug","none","beginner","20",["core"],["abs","core"],"On your back with arms and knees up, extend opposite arm and leg while keeping the lower back down."),
("Toe Touches","none","beginner","15",["core"],["abs"],"Legs straight up, crunch and reach your hands toward your toes."),
("Leg Raises","none","intermediate","15",["core"],["abs","hip_flexors"],"Lying flat, raise straight legs to vertical and lower slowly without touching the floor."),
("Russian Twists","none","intermediate","20",["core"],["obliques","abs"],"Seated, lean back with feet raised and rotate your torso side to side."),
("Side Plank","none","intermediate","20s/side",["core"],["obliques","core"],"On one forearm with the body in a straight line, lift the hips and hold."),
("V-ups","none","intermediate","12",["core"],["abs"],"Lift arms and legs at the same time to meet above your hips, then lower with control."),
("Hollow Body Rocks","none","intermediate","15",["core"],["abs"],"From a hollow hold, rock back and forth keeping the shape rigid."),
("Dragon Flag Negative","none","advanced","5",["core"],["abs","core"],"Gripping a bench or post behind your head, lower your straight body as slowly as possible."),
("L-sit","none","advanced","10s",["core"],["abs","hip_flexors","triceps"],"Support yourself on your hands with legs held straight out in front, parallel to the floor."),
("Windshield Wipers","none","advanced","10",["core"],["obliques","abs"],"Lying on your back with legs vertical, lower them side to side with control."),
# GYM
("Leg Press","machine","beginner","12",["legs","lower"],["quadriceps","glutes"],"Press the platform away until legs are almost straight, then lower under control."),
("Leg Extension","machine","beginner","12",["legs","lower"],["quadriceps"],"Extend the knees to lift the pad, pause at the top, lower slowly."),
("Leg Curl","machine","beginner","12",["legs","lower"],["hamstrings"],"Curl the pad toward your glutes, pause, then return slowly."),
("Lat Pulldown","machine","beginner","12",["pull","upper"],["lats","biceps"],"Pull the bar down to your upper chest, squeezing the shoulder blades, then return slowly."),
("Seated Row","machine","beginner","12",["pull","upper"],["upper_back","lats","biceps"],"Pull the handle to your stomach keeping the chest up, then extend the arms."),
("Shoulder Press","dumbbells","beginner","10",["push","upper"],["shoulders","triceps"],"Press dumbbells from shoulder height to overhead, lower with control."),
("Bicep Curls","dumbbells","beginner","12",["pull","upper"],["biceps"],"Curl the dumbbells up keeping the elbows by your sides, lower slowly."),
("Tricep Pushdown","machine","beginner","12",["push","upper"],["triceps"],"At a cable station, push the bar down until arms are straight, elbows tucked."),
("Calf Raise Machine","machine","beginner","15",["legs","lower"],["calves"],"Rise onto the balls of your feet against the machine's resistance, pause, lower fully."),
("Bent Over Row","dumbbells","intermediate","10",["pull","upper"],["upper_back","lats","biceps"],"Hinge at the hips with a flat back and row the dumbbells to your hips."),
]
assert len(E) == 66, len(E)

exercises, by_name = [], {}
for name, eq, lvl, spec, dirs, mus, desc in E:
    m = re.fullmatch(r"(\d+)(s?)(/side)?", spec)
    n, timed, side = int(m.group(1)), bool(m.group(2)), bool(m.group(3))
    ex = {
        "id": uid("exercise", name), "slug": slug(name), "name": name,
        "muscle_group": mus, "equipment": [eq], "level": lvl,
        "location": LOC[eq], "direction": dirs, "description": desc,
        "gif_url": None, "video_url": None,
        "reps_default": None if timed else n,
        "duration_default": n if timed else None,
        "per_side": side, "created_at": CREATED,
    }
    exercises.append(ex); by_name[name] = ex

STRUCT = {
  "rounds": dict(work_seconds=45, rest_exercise_seconds=15, rest_round_seconds=60),
  "tabata": dict(work_seconds=20, rest_exercise_seconds=10, rest_round_seconds=10, rounds=8),
  "emom":   dict(work_seconds=60, rest_exercise_seconds=0, rest_round_seconds=0),
  "amrap":  dict(work_seconds=0, rest_exercise_seconds=0, rest_round_seconds=0, rounds=0),
  "ladder": dict(work_seconds=0, rest_exercise_seconds=15, rest_round_seconds=60, rounds=1),
}
# name, direction, structure, equipment, level, location, minutes, rounds, exercises
T = [
("Leg Day Home","legs","rounds",["none"],"intermediate","home",20,4,["Jump Squats","Side Lunges","Single-leg Glute Bridge","Curtsy Lunges","Calf Raises"]),
("Leg Day Gym","legs","rounds",["machine"],"advanced","gym",25,4,["Leg Press","Leg Extension","Leg Curl","Calf Raise Machine","Jump Squats","Pistol Squat Negative"]),
("Push Day Home","push","tabata",["chair"],"beginner","home",16,8,["Incline Push-ups","Tricep Dips","Knee Push-ups","Push-ups"]),
("Push Day Gym","push","rounds",["dumbbells"],"intermediate","gym",20,4,["Shoulder Press","Chest Press","Tricep Pushdown","Diamond Push-ups","Pike Push-ups"]),
("Pull Day Home","pull","emom",["bar"],"intermediate","home",15,5,["Chin-ups","Australian Pull-ups","Negative Pull-ups"]),
("Pull Day Gym","pull","rounds",["machine"],"advanced","gym",25,4,["Lat Pulldown","Seated Row","Pull-ups","Wide Grip Pull-ups","Bent Over Row","Bicep Curls"]),
("Full Body Anywhere","full_body","rounds",["none"],"beginner","anywhere",20,4,["Squats","Push-ups","Lunges","Superman Holds","Plank"]),
("Full Body Home","full_body","amrap",["chair"],"intermediate","home",15,0,["Bulgarian Split Squats","Decline Push-ups","Tricep Dips","Step-ups","Mountain Climbers"]),
("Core Crusher","core","rounds",["none"],"beginner","home",12,3,["Plank","Bicycle Crunches","Dead Bug","Flutter Kicks"]),
("Upper Body Home","upper","rounds",["chair"],"intermediate","home",18,4,["Decline Push-ups","Tricep Dips","Pike Push-ups","Floor Pull-throughs","Superman Holds"]),
("Lower Body Home","lower","rounds",["none"],"beginner","home",15,3,["Squats","Lunges","Glute Bridges","Wall Sit","Calf Raises"]),
("Explosive Legs","legs","tabata",["none"],"advanced","home",20,8,["Jump Squats","Pistol Squat Negative","Curtsy Lunges","Nordic Curl Negative","Side Lunges"]),
("Push + Pull Mix","mix","emom",["bar"],"intermediate","home",20,5,["Chin-ups","Diamond Push-ups","Australian Pull-ups","Pike Push-ups"]),
("Leg + Core Mix","mix","rounds",["none"],"beginner","home",18,4,["Squats","Plank","Lunges","Bicycle Crunches","Glute Bridges"]),
("Full Body Gym","full_body","rounds",["machine"],"advanced","gym",30,4,["Leg Press","Lat Pulldown","Chest Press","Seated Row","Shoulder Press","Leg Curl"]),
("Beginner Full Body","full_body","rounds",["none"],"beginner","home",15,3,["Squats","Knee Push-ups","Glute Bridges","Mountain Climbers","Plank"]),
("Advanced Push","push","ladder",["dumbbells"],"advanced","gym",20,1,["Shoulder Press","Archer Push-ups","Clapping Push-ups","Pseudo Planche Push-ups"]),
("Home Leg Day","legs","rounds",["chair"],"beginner","home",18,4,["Box Squats","Step-ups","Glute Bridges","Lunges","Calf Raises"]),
("Travel Workout","full_body","emom",["none"],"intermediate","anywhere",12,3,["Jump Squats","Push-ups","Russian Twists","Lunges"]),
("5-Minute Core","core","tabata",["none"],"all","home",5,2,["Plank","Mountain Climbers","Bicycle Crunches","Hollow Body Hold"]),
]
assert len(T) == 20
templates = []
for name, d, st, eq, lvl, loc, mins, rounds, exs in T:
    timer = dict(STRUCT[st]); timer["rounds"] = rounds
    lst = []
    for i, en in enumerate(exs):
        ex = by_name[en]
        item = {"exercise_id": ex["id"], "order": i + 1,
                "reps": ex["reps_default"], "duration": ex["duration_default"]}
        if st == "ladder": item.update(reps=None, ladder=[1,2,3,4,5,4,3,2,1])
        lst.append(item)
    gear = sorted({e for en in exs for e in by_name[en]["equipment"]})
    if len(gear) > 1: gear = [g for g in gear if g != "none"]
    templates.append({
        "id": uid("template", name), "slug": slug(name), "name": name,
        "direction": d, "structure": st, "level": lvl, "location": loc,
        "equipment": gear, "is_premade": True, "created_by": None,
        "rounds": timer["rounds"], "work_seconds": timer["work_seconds"],
        "rest_exercise_seconds": timer["rest_exercise_seconds"],
        "rest_round_seconds": timer["rest_round_seconds"],
        "total_time_minutes": mins, "exercise_list": lst, "created_at": CREATED,
    })

os.makedirs(out, exist_ok=True)
for fn, data in (("exercises.json", exercises), ("templates.json", templates)):
    with open(os.path.join(out, fn), "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False); f.write("\n")
print(len(exercises), len(templates))
