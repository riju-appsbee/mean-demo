(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('referralSettingsResource', ['$resource',
        function($resource) {

            return $resource('/api/settings/referral/:method',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
