(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('todayDriversService', ['$resource',
        function($resource) {

            return $resource('/api/today-drivers/:method/:state/:mofid/:cityid',{
            	method: '@method',
            	id: '@state',
            	mofid: '@mofid',
            	cityid: '@cityid'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();
