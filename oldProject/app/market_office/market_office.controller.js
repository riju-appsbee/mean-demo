(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('MarketOfficeController', ['$rootScope', '$scope', 'marketOffice', 'moService', '$stateParams', '$state', '$location', '$window', 'marketOfficeCityService', 'zoneService', 'cityFactory',
        function($rootScope, $scope, marketOffice, moService, $stateParams, $state, $location, $window, marketOfficeCityService, zoneService, cityFactory) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            // Default values set for state
            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];
            $scope.country = 'US';

            //Error
            $scope.errors = {
                status: false,
                msg: ''
            };

            //Market office
            $scope.marketOffice = [];

            //Add, Edit Market office info
            $scope.params = {
                office_name: '',
                mail_sent: false,
                tax_percentage: 0.00,
                location: '',
                timezone: ''
            };

            //state selected - from url
            $scope.selectedState = $stateParams.state || 'CA';

            //market office listing
            $scope.marketOfficeList = function() {

                marketOffice.getAll($scope.selectedState, function(err, response) {
                    if (err === true) {
                        $scope.marketOffice = [];
                        $scope.errors.msg = 'No Records Found.';
                        $scope.errors.status = true;
                    } else {
                        $scope.errors.msg = '';
                        $scope.errors.status = false;
                        $scope.marketOffice = response;
                    }

                });
            };


            //change the current state selected
            $scope.changeState = function(state) {
                $scope.selectedState = state;
                $scope.marketOfficeList();
            };

            //Get market office information by id
            $scope.getMarketOfficeInfo = function() {
                var id = $stateParams.id;
                $scope.mkOfficeId = id;
                moService.get({
                    method: 'info',
                    state: $scope.selectedState,
                    id: id
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                        $location.path('/ng/market-office/list/' + $scope.selectedState);
                    } else {
                        $scope.params.office_name = response.result.office_name;
                        $scope.params.tax_percentage = response.result.tax_percentage;
                        $scope.params.mail_sent = (response.result.mail_sent === 'true') ? true : false;
                        $scope.params.location = response.result.location;
                        $scope.params.timezone = response.result.timezone;

                    }
                });
            };

            //add market office
            $scope.addMarketOffice = function($valid) {

                if ($valid) {
                    $scope.params.mail_sent = $scope.params.mail_sent.toString();

                    moService.save({
                        'jsonrpc': '2.0',
                        'method': 'add',
                        'state': $scope.selectedState,
                        'params': $scope.params
                    }, function(response) {
                        if (response.error) {
                            $scope.params.active = Boolean($scope.params.mail_sent);
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $location.path('/ng/market-office/list/' + $scope.selectedState);
                        }
                    });
                }
            };


            //# Update market Office
            $scope.updateMarketOffice = function($valid) {
                if ($valid) {
                    $scope.params.id = $stateParams.id;

                    $scope.params.mail_sent = $scope.params.mail_sent.toString();

                    moService.save({
                        'jsonrpc': '2.0',
                        'method': 'update',
                        'state': $scope.selectedState,
                        'params': $scope.params
                    }, function(response) {
                        if (response.error) {
                            $scope.params.mail_sent = Boolean($scope.params.mail_sent);
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.getMarketOfficeInfo();
                            $scope.toastrSuccess(response.result.message, {});
                        }
                    });
                }
            };


            //# Delete Market Office
            $scope.deleteMarketOffice = function(id) {
                if ($window.confirm('Do you really want to delete this market office?')) {
                    moService.delete({
                        method: 'delete',
                        state: $scope.selectedState,
                        id: id
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $scope.marketOfficeList();
                        }
                    });
                }
            };

            $scope.reset = function() {
                $scope.params.office_name = '';
                $scope.params.mail_sent = false;
                $scope.params.tax_percentage = 0.00;
                $scope.params.location = '';
                $scope.params.timezone = '';
                $scope.marketOfficeForm.$setPristine();
            }

            $scope.marketOfficeCityCount = function() {
                marketOfficeCityService.get({
                    method: 'count',
                    'state': $scope.selectedState,
                    'mofid': $stateParams.id
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;

                        $scope.marketOfficeCityListing();
                    }
                });
            };

            // Get all city name under a specific state
            $scope.allCitites = {};
            $scope.getStateCities = function() {
                if (!$stateParams.state) return false;

                cityFactory.getAll($stateParams.state, function(err, response) {
                    if (err === true) {
                        $scope.toastrError('No cities found.', {});
                    } else {
                        $scope.allCitites = response || {};
                        console.log($scope.allCitites);
                    }

                });
            };

            $scope.marketOfficeCityListing = function() {
                $scope.loderValue = true;
                marketOfficeCityService.get({
                    'method': 'list',
                    p: $scope.currentPage,
                    'state': $scope.selectedState,
                    'mofid': $stateParams.id
                }, function(response) {
                    $scope.info = {};
                    if (response.results) {
                        $scope.info = response.results;
                        angular.forEach($scope.info, function(value, key) {
                            // console.log(value.id);
                            value.listOfDeliveryZones = {};
                            zoneService.get({
                                'method': 'list',
                                'p': $scope.currentPage,
                                'state': $scope.selectedState,
                                'mofid': $stateParams.id,
                                'cityid': value.id
                            }, function(response2) {
                                if (response2.result) {
                                    value.listOfDeliveryZones = response2.result;
                                }
                            });
                        });
                        $scope.loderValue = false;
                    }
                });
            };

            // delete delivery zone function
            $scope.deleteDeliveryZone = function(cityID, zoneID) {
                if ($window.confirm('Do you really want to delete this delivery zone?')) {
                    zoneService.delete({
                        method: 'delete',
                        'state': $scope.selectedState,
                        'mofid': $stateParams.id,
                        'cityid': cityID,
                        id: zoneID
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $scope.marketOfficeCityCount();
                        }
                    });
                }
            };

            // delete city function
            $scope.deleteMktOfcCity = function(mktOfcCityId) {
                if (confirm('Do you really want to delete this market office city?')) {
                    marketOfficeCityService.delete({
                        method: 'delete',
                        id: mktOfcCityId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.results, {});
                            $scope.marketOfficeCityCount();
                        }
                    });
                }
            };

            //on page load
            $scope.init = function() {
                var stateInit = {
                    /*'ng.market-office.list': function() {
                        $scope.marketOfficeList();
                    },*/
                    'ng.market-office.edit': function() {
                        // individual promo details
                        $scope.getMarketOfficeInfo();
                        $scope.marketOfficeCityCount();
                        // $scope.getStateCities();
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
