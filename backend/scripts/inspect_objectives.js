// Run: node scripts/inspect_objectives.js 57 58 59
// This script prints tables and rows in the join table for given objective ids.
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const ids = process.argv.slice(2).map((a) => {
  const n = Number(a);
  return Number.isFinite(n) ? n : null;
}).filter((x) => x !== null);

if (!ids.length) {
  console.error('Usage: node scripts/inspect_objectives.js <id> [id...]');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    process.exit(1);
  }
});

function allAsync(sql, params=[]) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}

(async () => {
  try {
    console.log('Database:', dbPath);
    const tables = await allAsync("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('\nTables:');
    tables.forEach(t => console.log(' -', t.name));

    // Try to find likely join tables referencing objective and object
    const candidates = tables.map(t => t.name).filter(name => /objective|object/i.test(name));
    console.log('\nCandidate tables (match objective/object):');
    candidates.forEach(t => console.log(' -', t));

    // Look for a join table pattern
    const joinCandidates = tables.map(t => t.name).filter(name => /objective.*object|object.*objective|objective_object|object_object/i.test(name));
    console.log('\nJoin candidates (pattern):');
    joinCandidates.forEach(t => console.log(' -', t));

    if (!joinCandidates.length) {
      console.log('\nNo obvious join table found. You can inspect `tables` list manually.');
    }

    for (const jt of joinCandidates) {
      console.log(`\n-- PRAGMA table_info('${jt}')`);
      const cols = await allAsync(`PRAGMA table_info('${jt}')`);
      console.table(cols);

      for (const id of ids) {
        console.log(`\n-- Rows in ${jt} for objectiveId=${id}`);
        try {
          const rows = await allAsync(`SELECT * FROM "${jt}" WHERE objectiveId = ?`, [id]);
          console.table(rows);
        } catch (e) {
          // Maybe column name differs, try other common names
          const altNames = ['objective_id','objectiveId','objectiveId','objectiveid','objective','ObjectiveId'];
          let found = false;
          for (const col of altNames) {
            try {
              const rows = await allAsync(`SELECT * FROM "${jt}" WHERE "${col}" = ?`, [id]);
              if (rows && rows.length) {
                console.log(`Found rows using column ${col}:`);
                console.table(rows);
                found = true;
                break;
              }
            } catch (e2) {
              // ignore
            }
          }
          if (!found) console.log(`No rows found in ${jt} for objectiveId=${id} (or column name mismatch).`);
        }
      }
    }

    // Additionally print objectives table rows for the given ids
    console.log('\n-- Objectives rows:');
    const objRows = await allAsync(`SELECT id, name FROM objective WHERE id IN (${ids.map(()=>'?').join(',')})`, ids);
    console.table(objRows);

    db.close();
  } catch (err) {
    console.error('Error inspecting DB:', err);
    db.close();
    process.exit(1);
  }
})();
