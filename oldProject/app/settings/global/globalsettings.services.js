(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('globalSettingsResource', ['$resource',
        function($resource) {

            return $resource('/api/settings/global/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
