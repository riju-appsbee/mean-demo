(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('TodayDriversController', ['$window',
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        'todayDriversService',
        '$state',
        'marketOfficeCity',
        'deliveryZone',
        'marketOffice',
        function(
            $window,
            $rootScope,
            $scope,
            $http,
            $stateParams,
            $location,
            $timeout,
            todayDriversService,
            $state,
            marketOfficeCity,
            deliveryZone,
            marketOffice
        ) {
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.selectedDate = '';

            $scope.listOfTodayDrivers = {};

            // Pagination setup start
            $scope.currentPage = 1;
            $scope.maxSize = 1;
            $scope.pageChanged = function() {
                $scope.todayDriversList();
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

            $scope.selectedState = $stateParams.state || 'CA';

            //states
            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];

            //market office city
            $scope.moCity = '';
            $scope.cities = [];

            //drivers
            $scope.drivers = [];

            //get market office of based on state
            $scope.marketOffice = [];
            $scope.getMarketOfficeCity = function() {

                marketOfficeCity.getAll($scope.selectedState, $scope.mofid, function(err, response) {
                    if (err === true) {
                        $scope.cities = [];
                        $scope.deliveryZone = {};
                        $scope.drivers = [];
                        $scope.moCity = '';
                        $scope.toastrError('No Market Office City Records Found.', {});
                    } else {
                        $scope.deliveryZone = {};
                        $scope.drivers = [];

                        response.unshift({id:'all', city_name: 'All'});
                        $scope.cities = response;
                        $scope.moCity = null;

                        if ($scope.cities.length === 0) {
                            $scope.moCity = '';
                            $scope.toastrError('No Market Office City Records Found.', {});
                        }
                    }

                });
            };


            //get market office of based on state
            $scope.marketOffice = [];
            $scope.mofid = '';
            $scope.getMarketOffice = function() {
                marketOffice.getAll($scope.selectedState, function(err, response) {
                    if (err === true) {
                        $scope.marketOffice = [];
                        $scope.mofid = '';
                        $scope.cities = [];
                        $scope.moCity = '';
                        $scope.deliveryZone = {};
                        $scope.drivers = [];
                        $scope.toastrError('No Market Office Records Found.', {});
                    } else {
                        $scope.deliveryZone = {};
                        $scope.drivers = [];

                        $scope.marketOffice = response;
                        $scope.mofid = null;

                        // if ($scope.marketOffice.length > 0) {
                        //     $scope.mofid = $scope.marketOffice[0].id.toString();
                        //     $scope.changeMarketOffice();
                        // } else {
                        //     $scope.mofid = '';
                        //     $scope.toastrError('No Market Office Records Found.', {});
                        // }

                    }

                });
            };

            $scope.changeMarketOffice = function() {
                $scope.getMarketOfficeCity();
                $scope.getDriverList();
            };


            //get Delivery zones
            $scope.deliveryZone = {};
            $scope.getDeliveryZoneByDate = function() {

                //console.log($scope.selectedDate); return false;
                todayDriversService.get({
                    method: 'zone',
                    state: $scope.selectedState,
                    mofid: $scope.mofid,
                    cityid: $scope.moCity,
                    date: $scope.selectedDate
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {

                        $scope.deliveryZone = response.result;

                    }
                });
            };

            //get drivers list
            $scope.getDriverList = function(state, mofid) {
                $scope.drivers = [];
                todayDriversService.get({
                    'method': 'drivers',
                    'state': $scope.selectedState,
                    'mofid': $scope.mofid,
                    'date': $scope.selectedDate,
                }, function(response) {

                    if (response.error) {
                        $scope.errors.msg = response.error.message;
                        $scope.errors.status = true;
                    } else {
                        $scope.drivers = response.result;
                    }
                });
            };

            $scope.onDateChange = function() {
                $scope.getDriverList();
                if ($scope.moCity !== '') {
                    //$scope.deliveryZone = {};
                    $scope.getDeliveryZoneByDate();
                }
            };

            $scope.addDriverToZone = function(zoneID, driverID) {
                todayDriversService.save({
                    'jsonrpc': '2.0',
                    'method': 'add',
                    'params': {
                        state: $scope.selectedState,
                        mofid: $scope.mofid,
                        cityid: $scope.moCity,
                        driverid: driverID,
                        zoneid: zoneID,
                        date: $scope.selectedDate
                    }
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                        $scope.onDateChange();
                    } else {
                        $scope.toastrSuccess(response.result.message, {});
                    }
                });
            };

            $scope.removeDriverFromZone = function(zoneID, driverID, callback) {
                if ($window.confirm('Do you really want to remove the driver from this zone?')) {
                    var cb = callback || angular.noop;
                    todayDriversService.save({
                        'jsonrpc': '2.0',
                        'method': 'delete',
                        'params': {
                            state: $scope.selectedState,
                            mofid: $scope.mofid,
                            cityid: $scope.moCity,
                            driverid: driverID,
                            zoneid: zoneID,
                            date: $scope.selectedDate
                        }
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                            return cb(false);
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $scope.onDateChange();
                            return cb(true);
                        }
                    });
                }
            };

            $scope.init = function() {
                var date = new Date();
                var dd = date.getDate();
                var mm = date.getMonth() + 1;
                var yyyy = date.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                }
                var today = yyyy + '-' + mm + '-' + dd;
                $scope.selectedDate = today;

                //calling urls based on state
                var stateInit = {
                    'ng.today-drivers.list': function() {
                        $scope.getMarketOffice();
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
