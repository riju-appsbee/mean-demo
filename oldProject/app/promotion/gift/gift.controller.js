(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('GiftController', ['$rootScope',
        '$stateParams',
        '$state',
        '$scope',
        '$http',
        '$timeout',
        '$location',
        'math',
        'giftResource',
        function($rootScope, $stateParams, $state, $scope, $http, $timeout, $location, math, giftResource) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.gifts = {};

            $scope.states = [
                { id: 'CA', value: 'California' },
                { id: 'AZ', value: 'Arizona' },
                { id: 'MN', value: 'Minnesota' }
            ];

            $scope.params = {
                market_office_id: 1,
                state_code: '',
                code: '',
                title: '',
                amount: '',
                start_date: '',
                end_date: '',
                new_customer_only: false,
                active: true,
            };

            $scope.params_auto = {
                market_office_id: 1,
                state_code: '',
                no_of_codes: '',
                title: '',
                amount: '',
                start_date: '',
                end_date: '',
                active: true,
            };


            // Pagination setup strat
            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                $scope.list();
            };
            // Pagination setup end

            // Count total gift codes
            $scope.giftCount = function() {
                giftResource.get({ method: 'count', q: $scope.searchText }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;
                        $scope.maxSize = response.result.maxSize;

                        $scope.list();
                    }
                });
            };

            // Search gifts
            $scope.search = function() {
                $scope.giftCount();
            };

            //Fetch all gift codes
            $scope.list = function() {
                $scope.loaderValue = true;
                giftResource.get({ method: 'list', p: $scope.currentPage, q: $scope.searchText },
                    function(response) {
                        if (response.error) {
                            $scope.loaderValue = false;
                            $scope.toastrError(response.error, {});
                        } else {
                            $scope.loaderValue = false;
                            $scope.gifts = response.result;
                        }
                    });
            };


            //# Delete gift code
            $scope.delete = function(id) {
                if (window.confirm('Do you really want to delete this gift code?')) {
                    giftResource.delete({ method: 'delete', id: id }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error, {});
                        } else {
                            $scope.toastrSuccess(response.result, {});
                            $scope.list();
                        }
                    });
                }
            };


            //Add gift code
            $scope.add = function($valid) {

                if ($valid) {

                    //console.log($scope.params);return;
                    $scope.params.active = $scope.params.active.toString();
                    $scope.params.new_customer_only = $scope.params.new_customer_only.toString();
                    $scope.params.amount = math.round($scope.params.amount);

                    giftResource.save({ 'jsonrpc': '2.0', 'method': 'add', 'params': $scope.params },
                        function(response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrSuccess(response.result, {});
                                $location.path('/ng/gift/list');
                            }
                        });
                }

            };

            //Auto generate gift code
            $scope.autoGenerate = function($valid) {

                if ($valid) {
                    $scope.params_auto.active = $scope.params_auto.active.toString();

                    giftResource.save({ 'jsonrpc': '2.0', 'method': 'auto-generate', 'params': $scope.params_auto },
                        function(response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrSuccess(response.result, {});
                                $location.path('/ng/gift/list');
                            }
                        });
                }

            };


            //# get gift code info
            $scope.getInfo = function() {
                var giftId = $stateParams.id;

                if (giftId) {
                    giftResource.get({ method: 'info', id: giftId }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                            $location.path('/ng/gift/list');
                        } else {

                            $scope.params.code = response.result.code;
                            $scope.params.amount = response.result.amount;
                            $scope.params.title = response.result.title;
                            $scope.params.active = (response.result.active === 'true') ? true : false;
                            $scope.params.new_customer_only = (response.result.new_customer_only === 'true') ? true : false;
                            $scope.params.state_code = response.result.state_code;
                            $scope.params.market_office_id = response.result.market_office_id.toString();
                            $scope.params.end_date = response.result.end_date.substring(0, 10);
                            $scope.params.start_date = response.result.start_date.substring(0, 10);

                        }
                    });
                }
            };

            //Edit gift code by ID
            //# Update promo
            $scope.update = function($valid) {
                if ($valid) {

                    $scope.params.active = $scope.params.active.toString();
                    $scope.params.new_customer_only = $scope.params.new_customer_only.toString();
                    $scope.params.id = $stateParams.id;
                    $scope.params.amount = math.round($scope.params.amount);
                    giftResource.save({ 'jsonrpc': '2.0', 'method': 'update', 'params': $scope.params },
                        function(response) {
                            if (response.error) {

                                $scope.params.active = ($scope.params.active === 'true') ? true : false;
                                $scope.params.new_customer_only = ($scope.params.new_customer_only === 'true') ? true : false;
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrSuccess(response.result, {});
                                $location.path('/ng/gift/list');
                            }
                        });
                }
            };

            //Reset gift form by button click
            $scope.resetGiftForm = function() {
                $scope.params.code = '';
                $scope.params.title = '';
                $scope.params.amount = '';
                $scope.params.start_date = '';
                $scope.params.end_date = '';
                // $scope.params.active = true;
                // $scope.params.new_customer_only = false;
                $scope.params.state_code = "";
                /*
                // $scope.params.min_order_amount = 0.00;
                // $scope.params.max_uses = 0;
                // $scope.params.use_once_per_customer = false;
                // $scope.params.type = '';
                //$scope.deliveryZone = [];
                //$scope.marketOffice = [];
                */
                $scope.giftForm.$setPristine();
                $scope.giftForm.$setUntouched();
                // console.log($scope.params);
            };
            //Reset gift auto form by button click
            $scope.resetGiftAutoForm = function() {
                $scope.params_auto.state_code = "";
                $scope.params_auto.no_of_codes = '';
                $scope.params_auto.title = '';
                $scope.params_auto.amount = '';
                $scope.params_auto.start_date = '';
                $scope.params_auto.end_date = '';
                $scope.giftAutoForm.$setPristine();
                $scope.giftAutoForm.$setUntouched();
                // console.log($scope.params_auto);

            };

            $scope.init = function() {

                //calling list if list page is called
                var stateInit = {
                    'ng.gift.list': function() {
                        $scope.giftCount();
                    },
                    'ng.gift.edit': function() {
                        //individual gift details                        
                        $scope.getInfo();
                    }
                };

                if (stateInit[$state.$current.name] !== undefined) {
                    stateInit[$state.$current.name]();
                }
            };


            //Call on page load
            $scope.init();

        }
    ]);
})();
