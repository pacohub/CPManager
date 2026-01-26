const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) return console.error('OPEN ERR', err.message);
});

db.serialize(() => {
  db.all("PRAGMA table_info('sound_types')", (err, rows) => {
    if (err) {
      console.error('PRAGMA ERR', err.message);
    } else {
      console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
  });
});
