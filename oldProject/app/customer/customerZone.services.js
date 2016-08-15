(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('customerZoneResource', ['$http','$q', '$cookies',
        function($http, $q, $cookies) {

            return{         
          
                getDeliveryZones: function(user, callback) {
                    var cb = callback || angular.noop;
                    var deferred = $q.defer();

                    $http.post('api/customer/get-delivery-zones', user).
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
        }
    ]);
})();
