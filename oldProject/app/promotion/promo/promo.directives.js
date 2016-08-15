/***
Promo Directives
***/

(function() {
    'use strict';

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('datePicker', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                window.ComponentsDateTimePickers.init();
            }
        };
    });

})();

(function() {
    'use strict';

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('compareDate', function() {
        return {
            require: 'ngModel',
            scope: {
                otherModelValue: '=compareDate'
            },
            link: function(scope, element, attributes, ngModel) {                 
                ngModel.$validators.compareDate = function(modelValue) {
                    
                    var toDate = 0, fromDate = 0, myDate = [];
		    myDate=modelValue.toString().split('-');
		    toDate = (myDate.length === 3) ? parseInt(new Date(myDate[1]+'/'+myDate[2]+'/'+myDate[0]).getTime().toString()) : 0;
		    
		    
		    myDate = [];	
		    myDate = scope.otherModelValue.toString().split('-');
		    fromDate = (myDate.length === 3) ? parseInt(new Date(myDate[1]+'/'+myDate[2]+'/'+myDate[0]).getTime().toString()) : 0;
		 
                    return toDate > 0 && fromDate > 0 && toDate >= fromDate;
                };
     
                scope.$watch('otherModelValue', function(newVal) {
                    ngModel.$error.compareDate = false;
                    if(newVal !== '') {
                        ngModel.$validate();
                    }
                });
            }
        };
    });
})();

