(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('driverResource', ['$resource',
            function($resource) {

                return $resource('/api/driver/:method/:id', {
                    method: '@method',
                    id: '@id'
                }, {
                    send: { method: 'POST' }
                });
            }
        ]);
})();
