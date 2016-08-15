/***
GLobal Directives
***/

(function() {
    'use strict';

    // Route State Load Spinner(used on page or content load)
    angular.module('FoodjetsApp').directive('ngSpinnerBar', ['$rootScope',
        function($rootScope) {
            return {
                link: function(scope, element, attrs) {
                    // by defult hide the spinner bar
                    element.addClass('hide'); // hide spinner bar by default

                    // display the spinner bar whenever the route changes(the content part started loading)
                    $rootScope.$on('$stateChangeStart', function() {
                        element.removeClass('hide'); // show spinner bar
                    });

                    // hide the spinner bar on rounte change success(after the content loaded)
                    $rootScope.$on('$stateChangeSuccess', function() {
                        element.addClass('hide'); // hide spinner bar
                        $('body').removeClass('page-on-load'); // remove page loading indicator
                        window.Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu

                        // auto scorll to page top
                        setTimeout(function() {
                            window.App.scrollTop(); // scroll to the top on content load
                        }, $rootScope.settings.layout.pageAutoScrollOnLoad);
                    });

                    // handle errors
                    $rootScope.$on('$stateNotFound', function() {
                        element.addClass('hide'); // hide spinner bar
                    });

                    // handle errors
                    $rootScope.$on('$stateChangeError', function() {
                        element.addClass('hide'); // hide spinner bar
                    });
                }
            };
        }
    ]);

})();





(function() {
    'use strict';

    // Handle global LINK click
    angular.module('FoodjetsApp').directive('a', function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(e) {
                        e.preventDefault(); // prevent link click for above criteria
                    });
                }
            }
        };
    });

})();

(function() {
    'use strict';

    // Handle Dropdown Hover Plugin Integration
    angular.module('FoodjetsApp').directive('dropdownMenuHover', function() {
        return {
            link: function(scope, elem) {
                elem.dropdownHover();
            }
        };
    });

})();

(function() {
    'use strict';

    //used for loader showing
    angular.module('FoodjetsApp').directive('blocker', ['$location', function($location) {
        return {
            restrict: 'E',
            link: function(scope, element, attrs) {
                scope.unblock = function(id, message) {
                    $(id).unblock({
                        message: message
                    });
                };
                scope.block = function(id, message) {
                    $(id).block({
                        message: message
                    });
                };
            }
        };
    }]);
})();


(function() {
    'use strict';
    //For toaster message
    angular.module('FoodjetsApp').directive('toastr', ['$compile', function($compile) {
        return {
            restrict: 'E',
            replace: true,
            link: function($scope, element, attrs, ctrl) {
                window.toastr.options = {
                    'closeButton': true,
                    'positionClass': 'toast-top-right',
                    'showDuration': '150',
                    'hideDuration': '1000',
                    'timeOut': '2500',
                    'extendedTimeOut': '1000',
                    'showEasing': 'swing',
                    'hideEasing': 'linear',
                    'showMethod': 'fadeIn',
                    'hideMethod': 'fadeOut'
                };
                $scope.toastrSuccess = function(message, arg) {
                    window.toastr.success(message);
                };
                $scope.toastrError = function(message, arg) {
                    window.toastr.error(message);
                };
                $scope.toastrWarning = function(message, arg) {
                    window.toastr.warning(message);
                };
            }
        };
    }]);
})();

(function() {
    'use strict';

    // background color initialize on login page
    angular.module('FoodjetsApp').directive('addBgColor', function() {
        return {
            restrict: 'C',
            link: function(scope, elem) {
                $('body').css('background-color', '#364150');
            }
        };
    });

})();

(function() {
    // Angular file upload directive get the file data url (base64data)
    angular.module('FoodjetsApp').directive('uploadAble', ['$parse', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {

                var model = $parse(attrs.uploadAble);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    var file = element[0].files[0],
                        reader = new FileReader();

                    reader.onloadend = function(e) { // should apply promise here @flair
                        scope.$apply(function() {
                            modelSetter(scope, e.target.result);
                        });
                    };

                    reader.readAsDataURL(file);

                });
            }
        };
    }]);
})();

(function() {
    //Spinner button directive to work with ladda bootstrap
    angular.module('FoodjetsApp').directive('spinnerButton', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {

                Ladda.bind('.mt-ladda-btn', { timeout: 6000 });                

            }
        };
    });
})();

/***
GLobal Filters
***/

(function() {
    'use strict';


/**
 * Description:
 *     replace dashes from text with white space
 * Usage:
 *   {{some_text | nodash
}}
 */
angular.module('FoodjetsApp').filter('nodash', function () {
    return function (value) {
        return (!value) ? '' : value.replace(/-/g, ' ');
    };
});

})();
