const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const id = Number(process.argv[2] || 1);
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function run() {
  db.serialize(() => {
    db.all('SELECT * FROM sound_types WHERE soundTypeId = ?', [id], (err, rows) => {
      if (err) return console.error('SELECT ERR', err.message);
      console.log('JOIN ROWS BEFORE:', JSON.stringify(rows, null, 2));

      db.run('DELETE FROM sound_types WHERE soundTypeId = ?', [id], function (err2) {
        if (err2) return console.error('DELETE JOIN ERR', err2.message);
        console.log('DELETE JOIN CHANGES:', this.changes);

        db.all('SELECT * FROM sound_types WHERE soundTypeId = ?', [id], (err3, rows2) => {
          if (err3) return console.error('SELECT2 ERR', err3.message);
          console.log('JOIN ROWS AFTER:', JSON.stringify(rows2, null, 2));

          db.run('DELETE FROM sound_type WHERE id = ?', [id], function (err4) {
            if (err4) return console.error('DELETE TYPE ERR', err4.message);
            console.log('DELETE TYPE CHANGES:', this.changes);
            db.close();
          });
        });
      });
    });
  });
}

run();
