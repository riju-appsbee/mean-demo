(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('tel', function() {
        return function(tel) {
            if (!tel) {
                return '';
            }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country == 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    });

})();

(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('cut', function() {
        return function(value, wordwise, max, tail) {
            if (!value)
                return '';

            max = parseInt(max, 10);
            if (!max)
                return value;
            if (value.length <= max)
                return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    });

})();


//Removes spaces between string
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('spaceless', function() {
        return function(input) {
            if (input) {
                return input.replace(/\s+/g, '-');
            }
        };
    });

})();



//Add spaces between a string
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('spaceit', function() {
        return function(input) {
            if (input) {
                return input.replace(/-/g, ' ');
            }
        };
    });

})();



//Convert a string to Title case
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('titleCase', function() {
        return function(input) {
            input = input || '';
            return input.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        };
    });

})();


//Check if empty object
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('isEmpty', function() {
        var bar;
        return function(obj) {
            for (bar in obj) {
                if (obj.hasOwnProperty(bar)) {
                    return false;
                }
            }
            return true;
        };
    });

})();



//Appends a string with xx (Used here for credit cards)
(function() {
    'use strict';


    angular.module("FoodjetsApp").filter('concat_xx', function() {
        return function(input) {
            if (input) {
                return 'xxxx xxxx xxxx ' + input;
            }
        };
    });

})();



//Appends a string with 4x (Used here for credit cards)
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('concat_4x', function() {
        return function(input) {
            if (input) {
                return 'xxxx ' + input;
            }
        };
    });

})();



//Used in menu page for showing on which day order is available
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('current_day', function() {
        return function(input) {

            if (input === true) {
                return 'Available Today';
            } else {
                return 'Available Tomorrow';
            }

        };
    });

})();


//Reverse a array
(function() {
    'use strict';

    angular.module("FoodjetsApp").filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    });

})();
