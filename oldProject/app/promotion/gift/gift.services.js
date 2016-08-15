(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('giftResource', ['$resource',
        function($resource) {

            return $resource('/api/promotion/gift/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
