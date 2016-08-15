(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('itemResource', ['$resource',
            function($resource) {

                return $resource('/api/item/:method/:id/:menu_id', {
                    method: '@method',
                    id: '@id',
                    menu_id: '@menu_id'
                }, {
                    send: { method: 'POST' }
                });
            }
        ]);
})();
