(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('AppController', ['$scope', '$rootScope', '$state',
        function($scope, $rootScope, $state) {

        }
    ]);

})();

(function() {
    'use strict';

    /* Setup Layout Part - Header */
    angular.module('FoodjetsApp').controller('HeaderController',
        ['$scope',
        'authService',
        '$location',
        '$cookies',
        '$timeout',function(
            $scope,
            authService,
            $location,
            $cookies,
            $timeout) {
            $scope.$on('$includeContentLoaded', function() {
                window.Layout.initHeader(); // init header
            });
	    
            $scope.logout = function() {
            	var ck = $cookies.get('foodjets');
                if (ck) {
                    authService.logout({
                        'jsonrpc': '2.0',
                        'method': 'logout',
                        'params': { 'timestamp': Date.now() }
                    }).then(function(response) {
                        $cookies.remove('foodjets');
                        $timeout(function() { $location.path('/login'); }, 500);
                    })
                    .catch(function(err) {
                        $scope.toastrError('Server is not responding.Please try later.', {});
                    });
               }
               else
               {
               		$timeout(function() { $location.path('/login'); }, 500);
               }
            };

        }
    ]);

})();


(function() {
    'use strict';

    /* Setup Layout Part - Sidebar */
    angular.module('FoodjetsApp').controller('SidebarController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {
            window.Layout.initSidebar(); // init sidebar
        });
    }]);

})();


(function() {
    'use strict';

    /* Setup Layout Part - Quick Sidebar */
    angular.module('FoodjetsApp').controller('QuickSidebarController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {
            setTimeout(function() {
                window.QuickSidebar.init(); // init quick sidebar
            }, 2000);
        });
    }]);

})();


(function() {
    'use strict';
    /* Setup Layout Part - Theme Panel */
    angular.module('FoodjetsApp').controller('ThemePanelController', ['$scope', function($scope) {

    }]);

})();


(function() {
    'use strict';

    /* Setup Layout Part - Footer */
    angular.module('FoodjetsApp').controller('FooterController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {
            window.Layout.initFooter(); // init footer
        });
    }]);

})();
