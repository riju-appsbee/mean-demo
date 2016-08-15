(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('customerResource', ['$resource',
        function($resource) {

            return $resource('/api/customer/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
