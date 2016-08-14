'use strict';

module.exports = function(app){

	//Load model
	var webserviceModel = require('../../server/Models/webservice');
	
	// Routings

	// /api/actions

	app.post('/process' , webserviceModel.testPost);
	app.post('/processLogin' , webserviceModel.processLogin);
	app.post('/addBlog' , webserviceModel.addBlog);
	app.post('/viewBlogs' , webserviceModel.viewBlogs);
	app.post('/deleteBlog' , webserviceModel.deleteBlog);
	

	// var x="test";
	 //==> Redirect all request to index.html [for Angular JS]
	app.get('/*', webserviceModel.home);
}