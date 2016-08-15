(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('MarketStoreService', ['$resource',
        function($resource) {

            return $resource('/api/market-store/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
