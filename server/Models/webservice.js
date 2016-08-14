'use strict';
var connection = require('../../server/Config/database');

var async = require('async');

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
	addBlog: function(req, res){
		var response = {};
		var callback = function(response) {
    		res.send(response);
		};		
		var data = {
		   title:req.body.title,
		   description:req.body.description,
		   category_id:req.body.categoryId,
		   date_posted:new Date().toISOString().slice(0, 19).replace('T', ' ')
		};

		var query = connection.query("INSERT INTO blog_details set ? ",data, function(err, rows)
		    {			          
		        if(err){
		            response = {
			        		status:false,
			        		message:err
			        	}
		        }else{
		        	
		        		response = {
			        		status:true,
			        		message:"Successfully created a blog!"
			        	}
		        	
		        }
		        callback(response);			    									
		    });
		
	},
	viewBlogs: function(req, res){
		var response = {};
		var callback = function(response) {
    		res.send(response);
    		// console.log(response);
		};		
		

		var query = connection.query("SELECT blog_details.id,blog_details.title,blog_details.description,DATE_FORMAT(blog_details.date_posted,'%Y-%m-%d') AS date_posted,blog_categories.title as category FROM blog_details LEFT JOIN blog_categories ON blog_categories.id=blog_details.category_id", function(err, rows)
		    {			          
		        if(err){
		            response = {
			        		status:false,
			        		data:null,
			        		message:"Error while processing query"
			        	}
		        }else{
		        	
		        	connection.query("SELECT blog_categories.id,blog_categories.title FROM blog_categories WHERE status='1'", function(err2, rows2)
		    			{
			        		response = {
				        		status:true,
				        		message:"Successfully fetched blog!",
				        		data:rows,
				        		categories:rows2
				        	};
				        	// console.log(response);
				        	callback(response);	
			        	});
		        	
		        }
		        // callback(response);			    									
		    });
		
	},
	deleteBlog: function(req, res){
		// console.log(req.body);
		var response = {};
		var callback = function(response) {
    		res.send(response);
    		// console.log(response);
		};		
		

		var query = connection.query("DELETE FROM blog_details WHERE id = ?",req.body.id, function(err, rows)
		    {			          
		        if(err){
		            response = {
			        		status:false,
			        		message:err
			        	}
		        }else{
		        	
		        		response = {
			        		status:true,
			        		message:"Successfully deleted blog!"
			        	}
		        	
		        }
		        callback(response);			    									
		    });
		
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