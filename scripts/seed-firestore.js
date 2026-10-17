#!/usr/bin/env node
/**
 * Import seed/exercises.json and seed/templates.json into Firestore.
 *
 * Usage:
 *   npm install firebase-admin
 *   export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 *   node scripts/seed-firestore.js
 *
 * Documents are written with their `id` as the document ID, so running the
 * script again overwrites them instead of creating duplicates.
 */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

const BATCH_LIMIT = 500;

async function seed(collection, file) {
  const docs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed', file), 'utf8'));

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + BATCH_LIMIT)) {
      const data = { ...doc, created_at: admin.firestore.Timestamp.fromDate(new Date(doc.created_at)) };
      batch.set(db.collection(collection).doc(doc.id), data);
    }
    await batch.commit();
  }
  console.log(`${collection}: ${docs.length} documents written`);
}

(async () => {
  await seed('exercises', 'exercises.json');
  await seed('templates', 'templates.json');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
