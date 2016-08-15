(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('MarketOfficeCityController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', 'marketOfficeCityService', 'zoneService', 'fetchCityService', '$window', function($rootScope, $scope, $stateParams, $state, $location, marketOfficeCityService, zoneService, fetchCityService, $window) {

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        $scope.state = $stateParams.state;
        $scope.mofid = $stateParams.mofid;
        $scope.listOfDeliveryZones = [];
        $scope.allCities = [];
        // Pagination setup strat
        $scope.currentPage = 1;
        $scope.pageChanged = function() {
            $scope.marketOfficeCityListing();
        };
        // Pagination setup end

        // Count total employee
        $scope.marketOfficeCityCount = function() {
            marketOfficeCityService.get({
                method: 'count',
                'state': $stateParams.state,
                'mofid': $stateParams.mofid
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


        $scope.marketOfficeCityListing = function() {
            $scope.loderValue = true;
            marketOfficeCityService.get({ 'method': 'list', p: $scope.currentPage, 'state': $stateParams.state, 'mofid': $stateParams.mofid }, function(response) {
                $scope.info = {};
                if (response.results) {
                    $scope.info = response.results;
                    $scope.loderValue = false;
                }
            });
        };

        $scope.addMktOfcCity = function(cityinfo) {

            var saveMarketOfficeCity = function() {
                cityinfo.market_office_id = $stateParams.mofid;
                marketOfficeCityService.save({ 'method': 'add', params: cityinfo }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.results, {});
                        $location.path('/ng/market-office/edit/' + $stateParams.state + '/' + $stateParams.mofid);
                    }
                });
            };
            
            var fileInput = $('#mktOfcCityForm').find("input[type=file]")[0],
                file = fileInput.files && fileInput.files[0];
            if (file) {
                var img = new Image();
                window.URL = window.URL || window.webkitURL;
                img.src = window.URL.createObjectURL(file);
                img.onload = function() {
                    var width = img.naturalWidth,
                        height = img.naturalHeight;
                    // console.log(width, height);
                    window.URL.revokeObjectURL(img.src);
                    if (width !== 1100 && height !== 185) {
                        $scope.toastrError(' \'1100X185\' images are allowed only.', {});
                    } else {
                        saveMarketOfficeCity();
                    }

                };
            } else {
                saveMarketOfficeCity();
            }
            

        };

        $scope.editMktOfcCity = function(cityinfo) {
            //cityinfo.market_office_id = $stateParams.mofid;

            var fileInput = $('#mktOfcCityForm').find("input[type=file]")[0],
                file = fileInput.files && fileInput.files[0];
            var saveData = function() {
                marketOfficeCityService.save({ 'method': 'update', params: cityinfo }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.results, {});
                        $location.path('/ng/market-office/edit/' + $stateParams.state + '/' + $stateParams.mofid);
                    }
                });
            }

            if (file) {
                var img = new Image();
                window.URL = window.URL || window.webkitURL;
                img.src = window.URL.createObjectURL(file);
                img.onload = function() {
                    var width = img.naturalWidth,
                        height = img.naturalHeight;
                    // console.log(width, height);
                    window.URL.revokeObjectURL(img.src);
                    if (width !== 1100 && height !== 185) {
                        $scope.toastrError(' \'1100X185\' images are allowed only.', {});
                    } else {
                        saveData();
                    }

                };
            } else {
                saveData();
            }




        };

        $scope.deleteMktOfcCity = function(mktOfcCityId) {
            var self = this;
            if (confirm('Do you really want to delete this market office city?')) {
                marketOfficeCityService.delete({ method: 'delete', id: mktOfcCityId }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.results, {});
                        $scope.marketOfficeCityListing();
                    }
                });
            }
        };

        $scope.getMktOfcCityInfo = function() {
            var self = this;
            $scope.cityinfo = {};
            $scope.mkOfficeId = $stateParams.mofid;
            $scope.mkOfficeCityId = $stateParams.id;
            marketOfficeCityService.get({ 'method': 'edit', 'state': $stateParams.state, 'mofid': $stateParams.mofid, 'id': $stateParams.id }, function(response) {
                if (response.results) {
                    //$scope.cityinfo = response.results;
                    $scope.cityinfo.id = response.results.id;
                    $scope.cityinfo.city_name = response.results.city_name;
                    $scope.cityinfo.imagePath = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/' + response.results.skyline_img;
                    $scope.cityinfo.skyline_img = response.results.skyline_img;
                }
            });
        };

        // // Count total delivery zones
        $scope.deliveryZoneCount = function() {
            zoneService.get({
                method: 'count',
                state: $stateParams.state,
                mofid: $stateParams.mofid,
                cityid: $stateParams.id
            }, function(response) {
                // console.log(response);
                if (response.error) {
                    $scope.toastrError(response.error.message, {});
                } else {
                    $scope.totalItems = response.result.count;
                    $scope.numPerPage = response.result.numPerPage;

                    $scope.deliveryZoneList();
                }
            });
        };

        //get delivery zone listing
        $scope.deliveryZoneList = function() {
            $scope.loderValue = true;
            zoneService.get({
                'method': 'list',
                'p': $scope.currentPage,
                'state': $stateParams.state,
                'mofid': $stateParams.mofid,
                'cityid': $stateParams.id
            }, function(response) {

                if (response.error) {
                    $scope.errors.msg = response.error.message;
                    $scope.errors.status = true;
                } else {
                    $scope.listOfDeliveryZones = response.result;
                    $scope.loderValue = false;
                }
            });
        };

        // delete delivery zone function
        $scope.deleteDeliveryZone = function(zoneId) {
            if ($window.confirm('Do you really want to delete this delivery zone?')) {
                zoneService.delete({
                    method: 'delete',
                    'state': $stateParams.state,
                    'mofid': $stateParams.mofid,
                    'cityid': $stateParams.id,
                    id: zoneId
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.result.message, {});
                        $scope.deliveryZoneCount();
                    }
                });
            }
        };

        $scope.fetchAllCities = function() {
            // console.log($stateParams.state);
            fetchCityService.get({
                method: 'city-list-by-state',
                id: $stateParams.state
            }, function(response) {
                // console.log(response);
                if (response.error) {
                    $scope.toastrError(response.error.message, {});
                } else {
                    // console.log(response.result);
                    $scope.allCities = response.result;
                }
            });
        };

        $scope.init = function() {


            var stateInit = {
                'ng.market-office-city.list': function() {
                    $scope.fetchAllCities();
                    $scope.marketOfficeCityCount();
                },
                'ng.market-office-city.add': function() {
                    $scope.fetchAllCities();
                },
                'ng.market-office-city.edit': function() {
                    $scope.getMktOfcCityInfo();
                    $scope.deliveryZoneCount();
                    $scope.fetchAllCities();
                }
            }
            if (stateInit[$state.$current.name] !== undefined) {
                stateInit[$state.$current.name]();
            }
        };

        $scope.init();

    }]);

})();
