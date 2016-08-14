'use strict';

/**
 * @ngdoc function
 * @name nodeStartUpApp.controller:BlogCtrl
 * @description
 * # BlogCtrl
 * Controller of the nodeStartUpApp
 */


angular.module('nodeStartUpApp')
	.controller('blogController', ["$http", "$location", "$localStorage", "$timeout", "blogService",
		function($http, $location, $localStorage, $timeout, blogService) {
			
			var self = this;			
			self.blogs = {};
			self.allBlogs = {};
			self.categories = {};
			if ($localStorage.id == undefined || $localStorage.id <= 0) {
				$location.path('/');
			}else{
				self.id = $localStorage.id;
				self.name = $localStorage.name;
			}
			self.viewBlogs = function(){
				// console.log("Here");
				blogService.viewBlogs().then(function(data) {
					// console.log(data);return;
					var response = data.data;
					console.log(response);
					if(response.status == true){
						self.allBlogs = response.data;
						self.categories = response.categories;
					}else{
						console.log(response.message);
						alert(response.message);						
					}
				});
			};
			self.viewBlogs();
			self.addBlog = function() {
				// console.log("addBlog Called!", self.blogs);return;
				var title = self.blogs.title;
				var description = self.blogs.description;
				if(title && description){
				blogService.addBlog(self.blogs).then(function(data) {
					// console.log("Response : ", data.data);return;
					var response = data.data;
					// // console.log("response:",response);
					if(response.status == true){
						console.log(response.message);
						alert(response.message);
						$location.path("/superadmin/viewBlog");
						$location.replace();
					}else{
						console.log(response.message.code);
						alert(response.message.code);
						
					}
				});
				}else{
					alert("Invalid Blog Title Or Description!");
				}
			};
			self.deleteBlog = function(id){
				// console.log(id);return;
				if(id){
					blogService.deleteBlog(id).then(function(data) {
						// console.log("Response : ", data);return;
						var response = data.data;
						console.log("response:",response);
						if(response.status == true){
							console.log(response.message);
							alert(response.message);
							self.viewBlogs();
						}else{
							console.log(response.message.code);
							alert(response.message.code);
							
						}
					});
				}
			};

			$timeout(function() {
				
			},0);

		}
	]);