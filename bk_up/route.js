'use strict';
var async = require('async');

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'meanStartUpDb'
});



module.exports = {
	home: function(req, res){
		res.sendFile( __dirname + "/public/index.html" );
	},
	processLogin: function(req, res){

		var response = {};  var flag = true;
		// var callback = function(response) {
    		// res.send(response);
		// };		

		var checkRequest = function(){
			if(req.body.email==undefined || req.body.password==undefined){
				// console.log(req.body.email);
				flag = false;
				response = {
				        		status:false,
				        		message:"Blank email or password is not allowed!"
				        	};
				res.send(response);	
			}
		};
		var checkLogin = function(){

			connection.query('SELECT * FROM user_details WHERE email = ? AND password = ?',[req.body.email,req.body.password],function(err,rows)
			    {
			          // console.log(rows.length);return;
			        if(err){
			            response = {
				        		status:false,
				        		message:err
				        	}
			        }else{
			        	if(rows.length > 0){
				        	response = {
				        		id:rows[0].id,
				        		name:rows[0].first_name,
				        		email:rows[0].email,
				        		status:true,
				        		message:"successfully Logged In!"
				        	}
			        	}else{
			        		response = {
				        		status:false,
				        		message:"Authentication failed!"
				        	}
			        	}
			        }
			    	// console.log(response);
			        // callback(response);
			    	// callback();		
			    	res.send(response);									
			    });

		}
		// checkRequest();
		// checkLogin();
		
		
		async.series([			
			function(callback) {
				checkRequest();
				// console.log(response);
				// res.send(response);
				callback();
			},
			function(callback) {			
					if(flag==true){
						checkLogin(callback);
					}
					
		}]
		// , function(err) { 
			//This is the final callback
			// if (err) return callback(err);
    		// console.log('All tasks are done!');
    		// res.send(response);
		// }
		);
		
		
	},
	testPost: function(req, res){
		// console.log('here');		
		// Prepare output in JSON format
		// var response = {test:"test response"};
	// console.log(req.body.first_name);
		var response = {
		   first_name:req.body.first_name,
		   last_name:req.body.last_name
		};
		// // console.log(response);
		res.end(JSON.stringify(response));
	}

	
};
/*simple async example*/
/*
var test1 = function(){
	console.log("test1 called");
};
var test2 = function(a){
	console.log("test2 called");
};
async.series([
    function(callback) { //first task, and callback is its callback task
        test1();
        //this task is done
        callback();
        
    },
    function(callback) { //second task, and callback is its callback task
        test2(callback); //pass in the task callback 
    }
]
, function(err) { 
    console.log('This is the final callback');
}
);
*/
