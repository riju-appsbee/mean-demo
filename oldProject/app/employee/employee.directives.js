(function() {
    'use strict';

    // phone number formating..
    angular.module('FoodjetsApp').directive('inputMask', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask('mask', {mask:'(999) 999-9999'}); 
            }
        };
    });
})();