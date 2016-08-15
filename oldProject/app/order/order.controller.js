(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('OrderController', [
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        'orderResource',
        '$window',
        '$compile',
        '$state',
        'RTFoodJets',
        function($rootScope, $scope, $http, $stateParams, $location, $timeout, orderResource, $window, $compile, $state, RTFoodJets) {

            
            //get sate list
            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];

            var monthNames = [
              'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];


            //state selected - from url
            $scope.selectedState = '';
            $scope.selectedCity = '';
            $scope.orderDetails = {};
            $scope.orderItems = {};

            //change the current state selected
            $scope.changeState = function(state) {
                $scope.selectedState = state;
            };

            //change the current city selected
            $scope.changeCity = function(city) {
                $scope.selectedCity = city;
            };

            $scope.listOfOrder = [];

            //pagination setup strat
            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                $scope.orderList();
            };
            //end

            //order total order
            $scope.orderCount = function() { 
                orderResource.get({
                    method: 'count',
                    s: $scope.selectedState,
                    c: $scope.selectedCity,
                    q: $scope.searchText
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;

                        $scope.orderList();
                    }
                });
            };

            // Customer list
            $scope.orderList = function() {                
                $scope.loaderValue = true;
                orderResource.get({
                    method: 'list',
                    p: $scope.currentPage,                    
                    s: $scope.selectedState,
                    c: $scope.selectedCity,
                    q: $scope.searchText
                }, function(response) {
                    $scope.loaderValue = false;
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.listOfOrder = response.result[0];
                    }
                });
            };

            // search order
            $scope.searchOrder = function() {
                if (angular.isDefined($scope.selectedState) && $scope.selectedState !== '') {
                    $scope.orderCount();
                } else {
                    $scope.listOfOrder = [];
                    $scope.totalItems = 0;
                    $scope.numPerPage = 0;
                    $scope.toastrError('Please choose search option.', {});
                }
            };

            //get market office of based on state
            $scope.marketOfficeCitites = [];
            $scope.getMarketOfficeCitiesByState = function(state) {
                $scope.params.market_office_city_id = '';
                orderResource.get({
                    method: 'market-office-cities',
                    state: state
                }, function(response) {
                    if (response.error) {
                        $scope.marketOfficeCitites = [];
                    } else {
                        response.result.unshift({
                            id: '',
                            city_name: 'All'
                        });
                        // console.log(response.result);
                        $scope.marketOfficeCitites = response.result;
                    }
                });
                $scope.changeState(state);
            };


            $scope.getOrderDetails = function() {
                var orderNumber = $stateParams.orderNumber;
                if(orderNumber) {
                    orderResource.get({
                        method: 'get-order-details',
                        id: orderNumber
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.orderDetails = response.result;

                            var date = new Date($scope.orderDetails.updated_at);
                            var day = date.getDate();
                            var monthIndex = date.getMonth();
                            var year = date.getFullYear();
                            console.log($scope.orderDetails);
                            $scope.orderDetails.order_date = day + ' ' + monthNames[monthIndex] + ' ' + year;

                            if($scope.orderDetails.restaurant_id) {
                                var resId = $scope.orderDetails.restaurant_id;
                                var orderCode = $scope.orderDetails.state_code+$scope.orderDetails.id;

                                firebase.database().ref('order_details/'+resId+'/'+orderCode).once('value',function(snapshot){
                                    $scope.orderItems = snapshot.val();
                                    if (!$scope.$$phase) $scope.$apply();
                                    console.log($scope.orderItems);
                                });
                            }
                        }
                    });
                }
            };

            $scope.init = function() {
                var stateInit = {
                    'ng.order.list': function() {
                        $scope.orderCount();
                    },
                    'ng.order.details' : function() {
                        $scope.getOrderDetails();
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