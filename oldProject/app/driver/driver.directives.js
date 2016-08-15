/***
Driver Directives
***/

(function() {
    'use strict';

    //Date Picker Directive
    //Not needed as does not support orientation
    //We are using bootstrap 3 datepicker
    // angular.module('FoodjetsApp').directive('datePicker', function() {
    //     return {
    //         restrict: 'A',
    //         link: function(scope, elem) {
    //             window.ComponentsDateTimePickers.init();
    //         }
    //     };
    // });

    // phone number formating
    angular.module('FoodjetsApp').directive('inputMask', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask('mask', { mask: '(999) 999-9999' });
            }
        };
    });

})();
