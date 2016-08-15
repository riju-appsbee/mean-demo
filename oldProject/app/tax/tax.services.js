(function(){
	'use strict';
	angular.module('FoodjetsApp').factory('taxService' , ['$resource', function($resource){
		return $resource('/api/tax/:method/:state',{
        	method: '@method',
        	state:'@state'
        }, {
            send: { method: 'POST' }
        });
	}]);
})();
