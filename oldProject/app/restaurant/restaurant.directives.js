(function() {
    'use strict';

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('inputMask', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask('mask', {mask:'(999) 999-9999'}); 
            }
        };
    });

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('inputOrderAmount', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask('decimal', { rightAlign: false }); 
            }
        };
    });

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('maskNumber', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask({mask:'9', repeat: 20, greedy: !1}); 
            }
        };
    });

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

})();