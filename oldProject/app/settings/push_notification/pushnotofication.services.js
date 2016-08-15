(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('pushNotificationResource', ['$resource',
        function($resource) {

            return $resource('/api/settings/push-notification/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
