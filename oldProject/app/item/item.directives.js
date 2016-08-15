/***
Item Directives
***/

(function() {
    'use strict';

    //Date Picker Directive
    angular.module('FoodjetsApp').directive('datePicker', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                window.ComponentsDateTimePickers.init();
            }
        };
    });

})();
