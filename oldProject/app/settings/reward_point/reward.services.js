(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('rewardSettingsResource', ['$resource',
        function($resource) {

            return $resource('/api/settings/reward-point/:method',{
            	method: '@method',
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
