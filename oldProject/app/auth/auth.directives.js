/***
Login Directives
***/

(function() {
    'use strict';

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('loginBg', function() {
        return {
            restrict: 'C',
            link: function(scope, elem) {
            	
                // init background slide images
                elem.backstretch([
                    'assets/pages/img/login/bg1.jpg',
                    'assets/pages/img/login/bg2.jpg',
                    'assets/pages/img/login/bg3.jpg'
                    ], {
                      fade: 1000,
                      duration: 8000
                    }
                );

                $('.forget-form').hide();
            }
        };
    });

})();

(function() {
    'use strict';

    // background color initialize on login page
    angular.module('FoodjetsApp').directive('removeBgColor', function() {
        return {
            restrict: 'C',
            link: function(scope, elem) {
               
                $('body').css('background-color', '#fff');
            }
        };
    });

})();


(function() {
    'use strict';

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('backBtn', function() {
        return {
            restrict: 'C',
            link: function(scope, elem) {
               elem.click(function(){
		        $('.login-form').show();
		        $('.forget-form').hide();
		});
            }
        };
    });

})();


(function() {
    'use strict';

    // Show forget password form and hide login
    angular.module('FoodjetsApp').directive('forgetPassword', function() {
        return {
            restrict: 'C',
            link: function(scope, elem) {
               elem.click(function(){
		        $('.login-form').hide();
		        $('.forget-form').show();
		});
            }
        };
    });

})();


