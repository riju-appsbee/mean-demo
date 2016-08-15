(function() {
    'use strict';

    // compare password and confirm password
    angular.module('FoodjetsApp').directive('compareTo', function() {
        return {
            require: 'ngModel',
            scope: {
                otherModelValue: '=compareTo'
            },
            link: function(scope, element, attributes, ngModel) {
                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue === scope.otherModelValue.$modelValue;
                };

                scope.$watch('otherModelValue', function(newVal) {
                    ngModel.$error.compareTo = false;
                    if(newVal !== '') {
                        ngModel.$validate();
                    }
                });
            }
        };
    });

    // phone number formating
    angular.module('FoodjetsApp').directive('inputMask', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask('mask', {mask:'(999) 999-9999'}); 
            }
        };
    });
})();
