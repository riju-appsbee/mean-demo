(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('PromoController', ['$window',
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        'promoResource',
        '$state',
        'marketOffice',
        'deliveryZone',
        function($window,
            $rootScope,
            $scope,
            $http,
            $stateParams,
            $location,
            $timeout,
            promoResource,
            $state,
            marketOffice,
            deliveryZone) {
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.listOfPromos = {};

            // Pagination setup start
            $scope.currentPage = 1;
            $scope.maxSize = 1;
            $scope.pageChanged = function() {
                $scope.promoList();
            };
            // Pagination setup end

            $scope.params = {
                code: '',
                amount: '',
                title: '',
                active: false,
                min_order_amount: 0.00,
                max_uses: 0,
                new_customer_only: false,
                state_code: '',
                market_office_id: '',
                market_office_city_delivery_zone_id: '',
                use_once_per_customer: false,
                end_date: '',
                start_date: '',
                type: ''
            };

            //Error
            $scope.errors = {
                status: false,
                msg: ''
            };

            //states
            $scope.states = [
                { id: 'CA', value: 'California' },
                { id: 'AZ', value: 'Arizona' }
            ];

            //get market office of based on state
            $scope.marketOffice = [];
            $scope.getMarketOffice = function(state) {
                $scope.params.market_office_id = '';
                marketOffice.getAll(state, function(err, response) {
                    if (err === true) {
                        $scope.marketOffice = [];
                        $scope.toastrError("No Records Found.", {});
                    } else {
                        $scope.marketOffice = response;
                    }

                });
            };



            //get Delivery zones
            $scope.deliveryZone = [];
            $scope.getDeliveryZone = function(state, mofid) {
                $scope.params.market_office_city_delivery_zone_id = '';
                deliveryZone.getAll(state, mofid, function(err, response) {
                    if (err === true) {
                        $scope.deliveryZone = [];
                        $scope.toastrError("No Records Found.", {});
                    } else {
                        $scope.deliveryZone = response;
                    }

                });
            };


            // Count total promos
            $scope.promoCount = function() {
                promoResource.get({
                    method: 'count',
                    q: $scope.searchText
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;
                        $scope.maxSize = response.result.maxSize;

                        $scope.promoList();
                    }
                });
            };

            //get promo listing
            $scope.promoList = function() {
                $scope.loaderValue = true;
                promoResource.get({
                    'method': 'list',
                    'p': $scope.currentPage,
                    'q': $scope.searchText
                }, function(response) {

                    if (response.error) {
                        $scope.loaderValue = false;
                        $scope.listOfPromos = {};
                        $scope.errors.status = true;                        
                        $scope.errors.msg = response.error.message;
                    } else {
                        $scope.loaderValue = false;
                        $scope.errors.status = false;
                        $scope.errors.msg = '';
                        $scope.listOfPromos = response.result;
                    }
                });
            };

            //add promo
            $scope.addPromo = function($valid) {

                if ($valid) {
                    $scope.params.active = $scope.params.active.toString();
                    $scope.params.use_once_per_customer = $scope.params.use_once_per_customer.toString();
                    $scope.params.new_customer_only = $scope.params.new_customer_only.toString();

                    promoResource.save({ 'jsonrpc': '2.0', 'method': 'add', 'params': $scope.params }, function(response) {
                        if (response.error) {
                            $scope.params.active = Boolean($scope.params.active);
                            $scope.params.use_once_per_customer = Boolean($scope.params.use_once_per_customer);
                            $scope.params.new_customer_only = Boolean($scope.params.new_customer_only);
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $location.path('/ng/promo/list');
                        }
                    });
                }
            };

            //# get promo info
            $scope.getPromoInfo = function() {
                var promoId = $stateParams.id;
                if (promoId) {
                    promoResource.get({ method: 'info', id: promoId }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                            $location.path('/ng/promo/list');
                        } else {
                            $scope.getMarketOffice(response.result.state_code);
                            $scope.getDeliveryZone(response.result.state_code, response.result.market_office_id.toString());

                            $scope.params.code = response.result.code;
                            $scope.params.amount = response.result.amount;
                            $scope.params.title = response.result.title;
                            $scope.params.active = (response.result.active === 'true') ? true : false;
                            $scope.params.min_order_amount = response.result.min_order_amount;
                            $scope.params.max_uses = response.result.max_uses;
                            $scope.params.new_customer_only = (response.result.new_customer_only === 'true') ? true : false;
                            $scope.params.state_code = response.result.state_code;

                            var mofid = response.result.market_office_id;
                            $scope.params.market_office_id = mofid.toString();

                            var zone_id = response.result.market_office_city_delivery_zone_id;
                            $scope.params.market_office_city_delivery_zone_id = zone_id.toString();

                            $scope.params.use_once_per_customer = (response.result.use_once_per_customer === 'true') ? true : false;
                            $scope.params.end_date = response.result.end_date.substring(0, 10);
                            $scope.params.start_date = response.result.start_date.substring(0, 10);
                            $scope.params.type = response.result.type;

                        }
                    });
                }
            };

            //# Update promo
            $scope.updatePromo = function($valid) {
                if ($valid) {
                    $scope.params.id = $stateParams.id;

                    $scope.params.active = $scope.params.active.toString();
                    $scope.params.use_once_per_customer = $scope.params.use_once_per_customer.toString();
                    $scope.params.new_customer_only = $scope.params.new_customer_only.toString();

                    promoResource.save({ 'jsonrpc': '2.0', 'method': 'update', 'params': $scope.params }, function(response) {
                        if (response.error) {
                            $scope.params.active = Boolean($scope.params.active);
                            $scope.params.use_once_per_customer = Boolean($scope.params.use_once_per_customer);
                            $scope.params.new_customer_only = Boolean($scope.params.new_customer_only);
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $location.path('/ng/promo/list');
                        }
                    });
                }
            };

            //# Delete promo
            $scope.deletePromo = function(promoId) {
                if ($window.confirm('Do you really want to delete this promo?')) {
                    promoResource.delete({ method: 'delete', id: promoId }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $scope.promoList();
                        }
                    });
                }
            };

            $scope.reset = function() {
                $scope.params.code = '';
                $scope.params.amount = '';
                $scope.params.title = '';
                $scope.params.active = false;
                $scope.params.min_order_amount = 0.00;
                $scope.params.max_uses = 0;
                $scope.params.new_customer_only = false;
                //$scope.params.state_code= $scope.states[0].id;
                $scope.params.use_once_per_customer = false;
                $scope.params.end_date = '';
                $scope.params.start_date = '';
                $scope.params.type = '';
                //$scope.deliveryZone = [];
                //$scope.marketOffice = [];
                $scope.promoForm.$setPristine();
            };

            // Search promos
            $scope.search = function() {
                $scope.promoCount();
            };

            $scope.init = function() {
                //calling urls based on state
                var stateInit = {
                    'ng.promo.list': function() {
                        //promo count
                        $scope.promoCount();
                    },
                    'ng.promo.edit': function() {
                        //individual promo details
                        $scope.getPromoInfo();
                    },
                };

                if (stateInit[$state.$current.name] !== undefined) {
                    stateInit[$state.$current.name]();
                }
            };
            $scope.init();

        }
    ]);
})();
