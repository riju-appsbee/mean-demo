'use strict';

/**
 * @ngdoc function
 * @name nodeStartUpApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the nodeStartUpApp
 */


angular.module('nodeStartUpApp')
	.controller('loginController', ["$http", "$location", "$localStorage", "$timeout", "loginService",
		function($http, $location, $localStorage, $timeout, loginService) {
			
			var self = this;
			// self.showFormSeperator = false;
			// self.forgotForm = false;
			// self.forgotHeading = true;
			// self.forgetFormHeading = "";
			// self.displayForgetFormOne = true;
			// self.displayForgetFormTwo = false;
			// self.displayForgetFormThree = false;
			// self.successMsg = '';
			// self.errorMsg = "";
			self.users = {};
			if($localStorage.id > 0){
				$location.path('/superadmin/dashboard');
			}

			self.doLogin = function() {
				// console.log("doLogin Called!", self.users);return;
				var email = self.users.email;
				var password = self.users.password;
				if(email && password){
				loginService.login(self.users).then(function(data) {
					// console.log("Login Response : ", data.data);return;
					var response = data.data;
					// console.log("response:",response);
					if(response.status == true){
						//console.log("HERE");
						loginService.isLoggedIn = 1;
						$localStorage.id = response.id;
						$localStorage.name = response.name;
						$location.path("/superadmin/dashboard");
						$location.replace();
					}else{
						console.log(response.message);
						alert(response.message);
						
					}
				});
				}else{
					alert("Invalid Email/Password!");
				}
			};
			

			// self.doLogOut = function() {
			// 	// console.log('Logout clicked!');
			// 	$('#logoutButton').hide();
			// 	$('#loginButton').show();
			// 	// loginService.isLoggedIn = 0;
			// 	localStorage.removeItem("id");
			// 	localStorage.removeItem("name");
			// 	// $location.path("/");
			// };

			// $timeout(function() {
			    
			//     var button = $('#loginButton');
			//     var box = $('#loginBox');
			//     var form = $('#loginForm');
			//     button.removeAttr('href');
			//     button.mouseup(function(login) {
			//         box.toggle();
			//         button.toggleClass('active');
			//     });
			//     form.mouseup(function() { 
			//         return false;
			//     });
			//     $(this).mouseup(function(login) {
			//         if(!($(login.target).parent('#loginButton').length > 0)) {
			//             button.removeClass('active');
			//             box.hide();
			//         }
			//     });
			    
			// },0);
			


		}
	]);