(function() {
'use strict';

angular.module('FoodjetsApp').controller('OrderConfirmationController', [
    '$rootScope',
    '$stateParams',
    '$state',
    '$modal',
    '$window',
    '$scope',
    '$http',
    '$location',
    function(
        $rootScope, $stateParams, $state, $modal, $window, $scope, $http,
        $location) {

        //######### set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;



        //orderNumber
        $scope.orderConfirmation = function() {
            $scope.orderNumber = $stateParams.orderNumber;
        };

        $scope.init = function() {
            var stateInit = {
                'ng.customer.order.order-confirmation': function() {
                    $scope.orderConfirmation();
                }
            };

            if (stateInit[$state.$current.name] !== undefined) {
                stateInit[$state.$current.name]();
            }
        };

        $scope.init();


    }
]);

})();






