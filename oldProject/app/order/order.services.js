(function() {
    'use strict';

    angular.module('FoodjetsApp').factory('orderResource', ['$resource',
        function($resource) {
            return $resource('/api/order/:method/:id',{
                method: '@method',
                id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
