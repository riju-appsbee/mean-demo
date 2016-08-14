'use strict';
var config = require('./server/Config/config');

//Primary set up:hello world example
/*
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
*/

/*code back up:angular login*/
/*
var express = require('express');
var bodyParser = require('body-parser')
var routes = require('./route');
var morgan = require('morgan');
var cors = require('cors');
var app = express();





// Middlewares

app.use(cors());
app.use(morgan('dev')); // 'dev' for development output
app.use(express.static('public'));
app.use(bodyParser.json());


// Bodyparser depending on request
// var jsonParser = bodyParser.json();
// var urlencodedParser = bodyParser.urlencoded({ extended: true });

// Routings

// /api/actions

// app.post('/processLogin' , urlencodedParser , routes.processLogin);
app.post('/process' , routes.testPost);
app.post('/processLogin' , routes.processLogin);


 //==> Redirect all request to index.html [for Angular JS]
app.get('/*', routes.home);


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
*/