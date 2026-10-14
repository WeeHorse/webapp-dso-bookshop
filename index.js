const path = require('path');
const fs = require('fs');
const https = require('https');
const betterSqlite3 = require('better-sqlite3');
const db = betterSqlite3('./database/bookshop.db');
const port = process.env.PORT || 3005;
const express = require('express');

const app = express();

app.use(express.static('frontend'));

app.use(express.json({ limit: '100MB' }));

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
}, app).listen(port, () =>
  console.log('Listening on https://localhost:' + port));
const login = require('./login.js');

login(app, db);

const setupRESTapi = require('./rest-api');
setupRESTapi(app, db);

app.all('*', (req, res) => {
  res.status(404);
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'frontend', '404.html'));
});