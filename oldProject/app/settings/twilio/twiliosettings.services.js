(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('twilioSettingsResource', ['$resource',
        function($resource) {

            return $resource('/api/settings/twilio/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
