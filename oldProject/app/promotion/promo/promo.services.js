(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('promoResource', ['$resource',
        function($resource) {

            return $resource('/api/promotion/promo/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
