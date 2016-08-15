(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('menuResource', ['$resource',
            function($resource) {

                return $resource('/api/menu/:method/:id', {
                    method: '@method',
                    id: '@id'
                }, {
                    send: { method: 'POST' }
                });
            }
        ]);
})();
