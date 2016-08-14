'use strict';


angular.module('nodeStartUpApp')
	.factory('dashboardService', ["$http", 
		function($http) {
			var returnObj = {
				// login: function(userCredentials) {
				// 	// console.log("credentials : ", userCredentials);
				// 	return $http.post('http://localhost:1773/processLogin', userCredentials,{headers:{'content-Type':'application/json'}});
				// },
				
			}
			return returnObj;
		}
]);