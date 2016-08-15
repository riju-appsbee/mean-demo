(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('authService', ['$http','$q', '$cookies', 'userResource', 
    	function($http, $q, $cookies, userResource) {
    	
        return{
          
          login: function(user, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();

                $http.post('api/auth/login', user).
                success(function(data) {
                    deferred.resolve(data);
                    return cb();
                }).
                error(function(err) {
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

                return deferred.promise;
            },
            isSignedIn: function(cb){
            	var ck = $cookies.get('foodjets');
		var localUser = {};
                if (ck) {
                    localUser = userResource.save({
                    	'jsonrpc': '2.0',
                    	'method': 'isSignedIn',
                        'params':{'timestamp': Date.now()}
                    });
                }

                if (localUser.hasOwnProperty('$promise')) {
                    localUser.$promise.then(function(response) {
                    	//console.log(response);
                        if (typeof response.result === 'object')
                        {
                            cb(true);
                        } else {
                            cb(false);
                        }

                    }).catch(function() {
                        cb(false);
                    });
                } else {
                    cb(false);
                }
            },
            logout: function(user,callback){
            	var cb = callback || angular.noop;
                var deferred = $q.defer();
                
            	$http.post('api/auth/logout', user).
                success(function(data) {
                    deferred.resolve(data);
                    return cb();
                }).
                error(function(err) {
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

                return deferred.promise;
            }
        
        };
    }]);



})();

(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('userResource', ['$resource', function($resource) {
        return $resource('api/auth/user');
    }]);


})();
