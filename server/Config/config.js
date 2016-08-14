'use strict';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('cors');
// var async = require('async');

// var mysql = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '123456',
//   database : 'meanStartUpDb'
// });


// Middlewares

app.use(cors());
app.use(morgan('dev')); // 'dev' for development output
app.use(express.static('public'));
app.use(bodyParser.json());

//Load Controller
var webservice = require('../../server/Controllers/webservice')(app);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});