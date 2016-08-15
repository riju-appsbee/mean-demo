(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('restaurantResource', ['$resource',
        function($resource) {

            return $resource('/api/restaurant/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
