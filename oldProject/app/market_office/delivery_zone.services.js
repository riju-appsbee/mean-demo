(function(){
	'use strict';
	angular.module('FoodjetsApp').factory('zoneService' , ["$resource", function($resource){
		return $resource('/api/delivery-zone/:method/:state/:mofid/:cityid/:id',{
        	method: '@method',
        	state:'@state',
        	mofid:'@mofid',
        	cityid:'@cityid',
        	id: '@id'
        }, {
            send: { method: 'POST' }
        });
	}]);
})();
