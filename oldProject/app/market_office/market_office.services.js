(function(){
	'use strict';
	angular.module('FoodjetsApp').factory('moService' , ["$resource", function($resource){
		return $resource('/api/market-office/:method/:state/:id',{
        	method: '@method',
        	state:'@state',
        	id: '@id',
        }, {
            send: { method: 'POST' }
        });
	}]);
})();
