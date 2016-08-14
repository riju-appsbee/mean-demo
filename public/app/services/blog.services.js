'use strict';


angular.module('nodeStartUpApp')
	.factory('blogService', ["$http", 
		function($http) {
			var returnObj = {
				addBlog: function(blogs) {
					
					return $http.post('http://localhost:3000/addBlog', blogs,{headers:{'Content-Type':'application/json'}});
					
				},
				viewBlogs: function() {
					
					return $http.post('http://localhost:3000/viewBlogs');
					
				},
				deleteBlog: function(id) {
					
					return $http.post('http://localhost:3000/deleteBlog',{'id':id},{headers:{'Content-Type':'application/json'}});
					
				}
				
			}
			return returnObj;
		}
]);