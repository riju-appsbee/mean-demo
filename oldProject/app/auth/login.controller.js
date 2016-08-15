'use strict';
angular.module('FoodjetsApp').controller('LoginController',
	function($rootScope, $scope, $http, $timeout, authService, $cookies, $location) {

	    $scope.user = {
	    	email:'',
	    	password:''
	    };

	    $scope.submitLogin = function($valid)
	    {
	    	if($valid)
	    	{
	    		$scope.block('.foodjets-body', null);
	    		authService.login({'jsonrpc':'2.0',
	    				   'method':'login',
	    				   'params':{'email':$scope.user.email, 'password':$scope.user.password}
	    		    }).then(function(response) {

	    		    var data = response;

	    		    if(typeof data.result === 'object')
	    		    {
	    		    	//console.log(data.result);
	    		    	$cookies.put('foodjets', angular.toJson(data.result));
	    		    	$scope.toastrSuccess(data.result.message, {});
	    		    	$timeout(function(){$location.path('/ng/dashboard');},1000);
	    		    }
	    		    else
	    		    {
	    		    	$scope.toastrError(data.error.message, {});
	    		    }


			})
			.catch(function(err) {
			    $scope.toastrError('Server is not responding.Please try later.', {});
			});
	    	}
	    };
});
