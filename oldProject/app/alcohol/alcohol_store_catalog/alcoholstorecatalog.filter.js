//Appends a string with 4x (Used here for credit cards)
//Add spaces between a string
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('addcomma', function() {
        
        return function(input,last) {            
            if (input) {
                
                if(last)
                    return input;
                else
                    return input+', ';
            }
        };
    });

})();