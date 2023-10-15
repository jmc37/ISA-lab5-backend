const { Client } = require('pg');
const http = require('http');
const url = require('url');

const hostname = '127.0.0.1'; // localhost
const port = 3000;

const con = new Client({
  user: "root",
  password: "pDLDQmy1Npw4Hrn660wYUoNEsWEpFbZn",
  host: "dpg-cklg9bqv7m0s739cpme0-a.oregon-postgres.render.com",
  database: "lab5_xpv0",
  port: 5432, // Default PostgreSQL port
  ssl: true, // Enable SSL
});

con.connect()
  .then(() => {
    console.log("Connected to PostgreSQL!");
    createTable();
  })
  .catch(err => console.error('Error connecting:', err));

function createTable() {
  const sql = "CREATE TABLE IF NOT EXISTS patients (patientid SERIAL PRIMARY KEY, name VARCHAR(100), dateOfBirth DATE)";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if(req.method === 'GET'){
    if(pathname === '/patients'){
      con.query('SELECT * FROM patients', (err, result) => {
        if (err) throw err;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.rows));
      });
    }
  }

  if(req.method === 'POST'){
    if(pathname === '/make'){
      let data = [
        ['Sara Brown', '1901-01-01'],
        ['John Smith', '1941-01-01'],
        ['Jack Ma', '1961-01-30'],
        ['Elon Musk', '1999-01-01']
      ];
  
      let sql = "INSERT INTO patients (name, dateOfBirth) VALUES ($1, $2)";
  
      data.forEach(record => {
        con.query(sql, [record[0], record[1]], function (err, result) {
          if (err) throw err;
          console.log("Record inserted");
        });
      });
  
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Data inserted!\n');
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
