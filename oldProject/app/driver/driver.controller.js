(function() {
    'use strict';




    angular.module('FoodjetsApp').controller('DriverController', [
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        // '$window',
        '$compile',
        '$state',
        'driverResource',
        'marketOffice',
        'math',
        '$modal',
        function($rootScope,
            $scope,
            $http,
            $stateParams,
            $location,
            $timeout,
            // $window,
            $compile,
            $state,
            driverResource,
            marketOffice,
            math,
            $modal) {

            // Modal Test start

            $scope.items = ['item1', 'item2', 'item3'];

            $scope.animationsEnabled = true;

            $scope.toggleAnimation = function() {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };



            // Modal Test End


            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.params = {};
            $scope.drivers = [];
            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';
            $scope.noImagePath = 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image';
            $scope.hiddenDriverID = null;

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
                        $scope.toastrError('No Market Office Found Under This State.', {});
                    } else {
                        response.push({id:'', office_name: 'All'});
                        console.log(response);
                        $scope.marketOffice = response;
                    }

                });
            };

            // Pagination setup start
            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                $scope.driverList();
            };
            // Pagination setup end

            // Count total drivers
            $scope.driverCount = function() {
                driverResource.get({
                    method: 'count',
                    q: $scope.searchText,
                    ms: $scope.params.market_office_state_code || '',
                    mo: $scope.params.market_office_id || ''
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;

                        $scope.driverList();
                    }
                });
            };

            //Fetch list of drivers
            $scope.driverList = function() {
                $scope.loaderValue = true;
                driverResource.get({
                    method: 'list',
                    p: $scope.currentPage,
                    q: $scope.searchText,
                    ms: $scope.params.market_office_state_code || '',
                    mo: $scope.params.market_office_id || ''
                }, function(response) {
                    $scope.loaderValue = false;
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.drivers = response.result;
                    }
                });
            };
            //When someone types country code instead of clicking the country
            $scope.updateCountryCode = function(event) {
                $scope.params.country_code = angular.element(event.target).val();
            };

            //Add a new driver
            $scope.addDriver = function($valid) {
                if ($valid) {
                    if ($scope.params.phone) {
                        if ($scope.params.country_code !== undefined && $scope.params.country_code.indexOf('+') === -1) {
                            $scope.params.country_code = '+' + $scope.params.country_code;
                        }
                        $scope.params.phone = $scope.params.phone.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');


                    }
                    if ($scope.params.base_pay_rate) {
                        $scope.params.base_pay_rate = math.round($scope.params.base_pay_rate);
                    }
                    if ($scope.params.pay_per_meal) {
                        $scope.params.pay_per_meal = math.round($scope.params.pay_per_meal);
                    }

                    driverResource
                        .save({
                                'jsonrpc': '2.0',
                                'method': 'add',
                                'params': $scope.params
                            },
                            function(response) {
                                console.log(response);
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    $scope.toastrSuccess('Successfully Added A New Driver!', {});
                                    $location.path('/ng/driver/list');
                                }
                            });


                }
            };

            //Fetch details of a driver by ID before updation
            $scope.getDriverInfo = function() {
                var driverID = $stateParams.id;
                if (driverID) {

                    driverResource.get({
                        'method': 'driver-info',
                        'id': driverID
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.getMarketOffice(response.result.driver_market_office.state_code);
                            $scope.params.id = response.result.id;
                            $scope.params.first_name = response.result.first_name;
                            $scope.params.last_name = response.result.last_name;
                            $scope.params.onfleet_id = response.result.onfleet_id;
                            $scope.params.onfleet_first_name = response.result.onfleet_first_name;
                            $scope.params.onfleet_last_name = response.result.onfleet_last_name;
                            $scope.params.email = response.result.email;
                            $scope.params.country_code = response.result.country_code;
                            $scope.params.phone = response.result.phone;
                            $scope.params.address = response.result.address;
                            $scope.params.zipcode = response.result.zipcode;
                            $scope.params.state_code = response.result.state_code;
                            $scope.params.city_name = response.result.city_name;
                            $scope.params.driver_license = response.result.driver_license;
                            $scope.params.social_security_number = response.result.social_security_number;
                            $scope.params.driver_note = response.result.driver_note;
                            $scope.params.insurance_company_name = response.result.insurance_company_name;
                            $scope.params.image = response.result.image;
                            $scope.params.imagePath = $scope.cloud_url + response.result.image;
                            $scope.params.base_pay_rate = math.round(response.result.base_pay_rate).toFixed(2);
                            $scope.params.pay_per_meal = math.round(response.result.pay_per_meal).toFixed(2);
                            $scope.params.insurance_company_policy_number = response.result.insurance_company_policy_number;
                            $scope.params.insurance_policy_exp_date = response.result.insurance_policy_exp_date.substring(0, 10);
                            $scope.params.dmv_license_last_check_date = response.result.dmv_license_last_check_date.substring(0, 10);
                            $scope.params.dmv_license_next_check_date = response.result.dmv_license_next_check_date.substring(0, 10);
                            $scope.params.market_office_state_code = response.result.driver_market_office.state_code;
                            $scope.params.market_office_id = response.result.driver_market_office.market_office_id.toString();
                            $scope.params.onfleet_worker_status = (response.result.onfleet_worker_status === 'true') ? 'true' : 'false';
                            $scope.params.contractor = (response.result.contractor === 'true') ? 'true' : 'false';
                            $scope.params.deactivated = (response.result.active === 'true') ? 'false' : 'true';
                            $scope.params.foodjet_car = (response.result.foodjet_car === 'true') ? 'true' : 'false';
                        }
                    });

                }
            };

            //Update details of the driver if everything is okay
            $scope.updateDriver = function($valid) {
                if ($valid) {
                    // console.log($scope.params);return;
                    if ($scope.params.phone) {
                        if ($scope.params.country_code.indexOf('+') === -1) {
                            $scope.params.country_code = '+' + $scope.params.country_code;
                        }
                        $scope.params.phone = $scope.params.phone.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                    }
                    if ($scope.params.base_pay_rate) {
                        $scope.params.base_pay_rate = math.round($scope.params.base_pay_rate);
                    }
                    if ($scope.params.pay_per_meal) {
                        $scope.params.pay_per_meal = math.round($scope.params.pay_per_meal);
                    }
                    driverResource.save({
                            'jsonrpc': '2.0',
                            'method': 'update',
                            'id': $scope.params.id,
                            'params': $scope.params
                        },
                        function(response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrSuccess(response.result, {});
                                $location.path('/ng/driver/list');
                            }
                        });
                }
            };

            //delete driver by ID
            $scope.deleteDriver = function(driverID) {
                if (window.confirm('Do you really want to delete this driver?')) {
                    driverResource.delete({
                        'method': 'delete',
                        'id': driverID
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.init();
                            $scope.toastrSuccess(response.result, {});
                        }
                    });
                }
            };
            //Clear image while admin clicks remove button
            $scope.clearImage = function() {
                $scope.params.image = '';
                $scope.params.imagePath = '';
                angular.element('.fileinput-preview img').attr('src', $scope.noImagePath);
            };

            $scope.updateDriverIndex = function(id) {
                    $scope.hiddenDriverID = id;
                }
                //Clear send message form while user closes message pop up
            $scope.clearSendMessageForm = function(sendMessageForm) {
                $scope.params.message = '';
                sendMessageForm.$setPristine();
                sendMessageForm.$setUntouched();
            };
            //Send message to driver's mobile if everything is okay
            $scope.sendMessage = function(sendMessageForm) {
                if (sendMessageForm.$valid) {
                    //Post message starts
                    driverResource.save({
                            'jsonrpc': '2.0',
                            'method': 'send-message',
                            'id': $scope.hiddenDriverID,
                            'params': { message: $scope.params.message }
                        },
                        function(response) {
                            $scope.params.message = '';
                            sendMessageForm.$setPristine();
                            sendMessageForm.$setUntouched();
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrSuccess(response.result, {});
                            }
                        });
                } else {
                    $scope.toastrError('Invalid message input.', {});
                }
            };

            // Search driver
            $scope.searchDriver = function() {
                if (!!$scope.params.market_office_state_code) {
                    $scope.driverCount();
                } else {
                    $scope.toastrError('Please select state.', {});
                }
            };

            //Reset driver form by button click
            $scope.resetDriverForm = function() {
                $scope.params.first_name = '';
                $scope.params.last_name = '';
                $scope.params.onfleet_first_name = '';
                $scope.params.onfleet_last_name = '';
                $scope.params.email = '';
                $scope.params.country_code = '+1';
                $scope.params.phone = '';
                $scope.params.address = '';
                $scope.params.zipcode = '';
                $scope.params.state_code = '';
                $scope.params.city_name = '';
                $scope.params.driver_license = '';
                $scope.params.social_security_number = '';
                $scope.params.driver_note = '';
                $scope.params.insurance_company_name = '';
                $scope.params.image = '';
                $scope.params.imagePath = '';
                $scope.params.base_pay_rate = '';
                $scope.params.pay_per_meal = '';
                $scope.params.insurance_company_policy_number = '';
                $scope.params.insurance_policy_exp_date = '';
                $scope.params.dmv_license_last_check_date = '';
                $scope.params.dmv_license_next_check_date = '';
                $scope.params.market_office_state_code = '';
                $scope.params.market_office_id = '';
                $scope.params.onfleet_worker_status = 'false';
                $scope.params.contractor = 'true';
                $scope.params.deactivated = 'false';
                $scope.params.foodjet_car = 'false';
                $scope.driverForm.$setPristine();
                $scope.driverForm.$setUntouched();
                // console.log($scope.params);

            };


            

            //Initializing controller functions
            $scope.init = function() {
                var stateInit = {
                    'ng.driver.add': function() {
                        $scope.params.country_code = '+1';
                    },
                    'ng.driver.list': function() {
                        // $scope.driverCount();
                    },
                    'ng.driver.edit': function() {
                        $scope.params.country_code = '+1';
                        $scope.getDriverInfo();                        
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
