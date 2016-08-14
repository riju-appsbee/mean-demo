'use strict';


angular.module('nodeStartUpApp')
	.factory('loginService', ["$http", "$localStorage","$location",
		function($http, $localStorage, $location) {
			var returnObj = {
				login: function(userCredentials) {
					// console.log("credentials : ", userCredentials);
					return $http.post('http://localhost:3000/processLogin', userCredentials,{headers:{'Content-Type':'application/json'}});
					
				},
				logout: function() {
						// loginService.isLoggedIn = 0;
						$localStorage.$reset();
						$location.path('/');

					},
				// isLoggedIn : 0
			}
			return returnObj;
		}
]);