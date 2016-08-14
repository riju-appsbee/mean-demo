'use strict';

/**
 * @ngdoc overview
 * @name nodeStartUpApp
 * @description
 * # nodeStartUpApp
 *
 * Main module of the application.
 */
angular
	.module('nodeStartUpApp', [
		// 'ngAnimate',
		// 'ngCookies',
		// 'ngResource',
		'ngRoute',
		// 'ngSanitize',
		// 'ngTouch',
		'ngStorage',
		// 'ngDragDrop',
	])
	.config(function($routeProvider, $httpProvider, $compileProvider) {   
		// $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
		$routeProvider
			.when('/', {
				templateUrl: 'templates/login.html',
				controller: 'loginController',
				controllerAs: 'LoginCtrl'
			})
			.when('/superadmin/dashboard', {
				templateUrl: 'templates/dashboard.html',
				controller: 'dashboardController',
				controllerAs: 'DashCtrl'
			})
			.when('/superadmin/addBlog', {
				templateUrl: 'templates/addBlog.html',
				controller: 'blogController',
				controllerAs: 'BlogCtrl'
			})
			.when('/superadmin/viewBlog', {
				templateUrl: 'templates/viewBlog.html',
				controller: 'blogController',
				controllerAs: 'BlogCtrl'
			})
			// .when('/superadmin/login', {
			// 	templateUrl: 'templates/login.html',
			// 	controller: 'loginController',
			// 	controllerAs: 'LoginCtrl'
			// })
			// .when('/superadmin/yearstream/:orgID', {
			// 	templateUrl: 'views/yearstream.html',
			// 	controller: 'yearstreamController',
			// 	controllerAs: 'StreamCtrl'
			// })										
			.when('/superadmin/logout', {
				resolve: {
					details: ["loginService",
						function(loginService) {
							loginService.logout();							
						}
					]
				}
			})
			.otherwise({
				redirectTo: '/'
			});

			$httpProvider.defaults.headers.common = {};
			$httpProvider.defaults.headers.post = {};
			$httpProvider.defaults.headers.put = {};
			$httpProvider.defaults.headers.patch = {};
	});