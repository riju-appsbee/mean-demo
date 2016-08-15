(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('DashboardController', ['$rootScope', '$scope', '$http', '$timeout', 'Globalutc', function($rootScope, $scope, $http, $timeout, Globalutc) {

        console.log(Globalutc.now());

        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            window.App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

    }]);

})();
