(function(){
	'use strict';
	angular.module('FoodjetsApp').factory('employeeService' , ["$resource", function($resource){
		return $resource('/api/employee/:method/:id',{
        	method: '@method',
        	id: '@id'
        }, {
            send: { method: 'POST' }
        });
	}]);
})();