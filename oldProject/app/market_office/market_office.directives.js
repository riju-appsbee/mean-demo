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


