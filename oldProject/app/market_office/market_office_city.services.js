(function(){
	'use strict';
	angular.module('FoodjetsApp').factory('marketOfficeCityService' , ["$resource", function($resource){
		return $resource('/api/market-office-city/:method/:state/:mofid/:id',{
            method: '@method',
        	state: '@state',
        	mofid: '@mofid',
        	id: '@id'
        }, {
            send: { method: 'POST' }
        });
	}]);

    angular.module('FoodjetsApp')
    .factory('fetchCityService', ['$resource',
        function($resource) {

            return $resource('/api/customer/:method/:id',{
                method: '@method',
                id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);

})();
