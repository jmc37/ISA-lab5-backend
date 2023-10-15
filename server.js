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

con.on('error', (err) => {
  console.error('PostgreSQL client error:', err);
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
  });
}

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if(req.method === 'GET'){
    if(pathname === '/patients/'){
      createTable();
      const request = query.request
      con.query(request, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result.rows));
      });
    }
  }

  if(req.method === 'POST'){
    if(pathname === '/make'){
      createTable();
      let data = [
        ['Sara Brown', '1901-01-01'],
        ['John Smith', '1941-01-01'],
        ['Jack Ma', '1961-01-30'],
        ['Elon Musk', '1999-01-01']
      ];
  
      let sql = "INSERT INTO patients (name, dateOfBirth) VALUES ($1, $2)";
  
      data.forEach(record => {
        con.query(sql, [record[0], record[1]], function (err, result) {
          if (err) {
            console.error('Error inserting record:', err);
          }
        });
      });
  
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Data inserted!\n');
    }

    if(pathname === '/add'){
      createTable();
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString(); // convert buffer to string
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const request = data.request;
          con.query(request, (err, result) => {
            if (err) {
              console.error('Error executing query:', err);
              res.statusCode = 500;
              res.end('Internal Server Error');
              return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
          });
        } catch (error) {
          console.error('Error parsing request body:', error);
          res.statusCode = 400;
          res.end('Bad Request');
        }
      });
    }
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
