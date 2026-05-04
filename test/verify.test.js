const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const assert = require('assert');

function runScript(db, script) {
  const sql = fs.readFileSync(script, 'utf8');
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getAllSpecifiedFromContactInfo = (db) => {
  const sql = `SELECT * FROM Contact_Info WHERE ADDRESS LIKE "%Cityville%" OR ADDRESS LIKE "%Suburbia%"`;
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const buildCounts = (infos) => {
  console.log(infos)
  let cityville = 0;
  let suburbia = 0;
  let cityzip = infos.find(info => info.ADDRESS.includes("Cityville")).ZIP_CODE;
  let suburbzip = infos.find(info => info.ADDRESS.includes("Suburbia")).ZIP_CODE;
  infos.forEach((info) => {
    if(info.ADDRESS.includes("Cityville"))
      cityville++;
    if(info.ADDRESS.includes("Suburbia"))
      suburbia++;
  });

  return [
    {
      Count: cityville,
      ZIP_CODE: cityzip
    },
    {
      Count: suburbia,
      ZIP_CODE: suburbzip
    }
  ];
}

const orderByCount = (a, b) => {
  if (a.Count > b.Count)
    return 1;
  else if (b.Count > a.Count)
    return -1;
  else
    return 0;
}


describe('the SQL in the `exercise.sql` file', () => {
  let db;
  let scriptPath;

  beforeAll(() => {
    const dbPath = path.resolve(__dirname, '..', 'lesson36.db');
    db = new sqlite3.Database(dbPath);

    scriptPath = path.resolve(__dirname, '..', 'exercise.sql');
  });

  afterAll(() => {
    db.close();
  });

  it('should return count of zip codes in contact_info for cityville and suburbia', async () => {
    const results = await runScript(db, scriptPath);
    const infos = await getAllSpecifiedFromContactInfo(db);
    const expected = buildCounts(infos);

    expect(results.sort(orderByCount)).toEqual(expected.sort(orderByCount));
  });
});
