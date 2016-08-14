'use strict';

var mysql = require('mysql');
var connection = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '123456',
			database : 'meanStartUpDb'
		});
connection.connect(function(err) {
    if (err) {
    console.log('error connecting: ' + err.stack);
    return;
}});
module.exports = connection;