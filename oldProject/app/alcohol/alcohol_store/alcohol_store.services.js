(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('alcoholStoreService', ['$resource',
        function($resource) {

            return $resource('/api/alcohol-store/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
