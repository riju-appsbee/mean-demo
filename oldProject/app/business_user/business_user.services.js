(function() {
    'use strict';
    
    angular.module('FoodjetsApp')
    .factory('businessResource', ['$resource',
        function($resource) {

            return $resource('/api/customer/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);

    angular.module('FoodjetsApp').factory('businessUserService', ["$resource", function($resource) {
        return $resource('/api/query/search-path/', {
            q: '@q',
            path: '@path'
        }, {
            send: { method: 'POST' }
        });
    }]);

})();
