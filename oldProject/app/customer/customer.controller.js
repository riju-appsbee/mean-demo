(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('CustomerController', [
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        'customerResource',
        'marketOffice',
        '$window',
        '$compile',
        '$state',
        function($rootScope, $scope, $http, $stateParams, $location,
            $timeout, customerResource, marketOffice, $window, $compile, $state) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.params = {};
            $scope.allStates = {};
            $scope.allCities = {};

            //states
            $scope.states = [
                { id: 'CA', value: 'California' },
                { id: 'AZ', value: 'Arizona' }
            ];
            //get market office of based on state
            // $scope.marketOffice = [];

            // $scope.getMarketOffice = function(state) {
            //     $scope.params.market_office_id = 'All';
            //     marketOffice.getAll(state, function(err, response) {
            //         if (err === true) {
            //             $scope.marketOffice = [];
            //             $scope.toastrError('No Market Office Found Under This State.', {});
            //         } else {
            //             response.unshift({id:'', office_name: 'All'});
            //             $scope.marketOffice = response;
            //         }

            //     });
            // };

            $scope.listOfCustomers = [];
            // Pagination setup strat
            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                $scope.customerList();
            };
            // Pagination setup end

            // Count total customer
            $scope.customerCount = function() {
                var mo = '';
                if ($scope.params.market_office_id !== 'All') {
                    mo = $scope.params.market_office_id;
                }
                // console.log(mo);
                customerResource.get({
                    method: 'count',
                    q: $scope.searchText,
                    // ms: $scope.params.market_office_state_code || '',
                    // mo: mo || ''
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;

                        $scope.customerList();
                    }
                });
            };

            // Customer list
            $scope.customerList = function() {
                var mo = '';
                if ($scope.params.market_office_id !== 'All') {
                    mo = $scope.params.market_office_id;
                }
                $scope.loaderValue = true;
                customerResource.get({
                    method: 'list',
                    p: $scope.currentPage,
                    q: $scope.searchText,
                    // ms: $scope.params.market_office_state_code || '',
                    // mo: mo || ''
                }, function(response) {
                    $scope.loaderValue = false;
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.listOfCustomers = response.result[0];
                    }
                });
            };

            // Search customer
            $scope.searchCustomer = function() {
                if ($scope.searchText) {
                    $scope.customerCount();
                } else {
                    $scope.listOfCustomers = [];
                    $scope.totalItems = 0;
                    $scope.numPerPage = 0;
                    $scope.toastrError('Please type email address,first name,last name or phone number of the customer!', {});
                }
            };

            //# Add customer
            $scope.addCustomer = function($valid) {
                if ($valid) {
                    if ($scope.params.phone) {
                        if ($scope.params.country_code.indexOf('+') === -1) {
                            $scope.params.country_code = '+' + $scope.params.country_code;
                        }
                        $scope.params.phone = $scope.params.phone.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                    }
                    customerResource.save({
                        'jsonrpc': '2.0',
                        'method': 'add',
                        'params': $scope.params
                    }, function(response) {
                        console.log(response);
                        if (response.error) {
                            if(angular.isDefined(response.error.message)){
                                $scope.toastrError(response.error.message, {});                                
                            }else{
                                $scope.toastrError(response.error, {});                                
                            }
                        } else {
                            $scope.toastrSuccess(response.result, {});
                            $location.path('/ng/customer/list');
                        }
                    });
                }
            };

            //# get customer info
            $scope.getCustomerInfo = function() {
                var customerId = $stateParams.id;
                // console.log(customerId);
                if (customerId) {
                    customerResource.get({
                        method: 'customer-info',
                        id: customerId
                    }, function(response) {
                        // console.log(response);
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.params.id = response.result.id;
                            $scope.params.onfleet_id = response.result.onfleet_id;
                            $scope.params.first_name = response.result.first_name;
                            $scope.params.last_name = response.result.last_name;
                            $scope.params.email = response.result.email;
                            $scope.params.phone = response.result.phone;
                            $scope.params.state = response.result.state;
                            $scope.params.city = response.result.city;
                            $scope.params.zip_code = response.result.zip_code;
                            $scope.params.address = response.result.address;
                            $scope.params.credit = response.result.credit;
                            $scope.params.country_code = response.result.country_code;
                            $scope.params.onfleet_note = response.result.onfleet_note;
                            $scope.params.internal_note = response.result.internal_note;
                            $scope.params.verified_phone = (response.result.verified_phone === 'true') ? true : false;
                            $scope.params.daily_email = (response.result.receive_daily_email === 'true') ? true : false;
                            $scope.params.receive_phone_call = (response.result.receive_phone_call === 'true') ? true : false;
                            $scope.params.skip_sms_notifications = (response.result.skip_sms_notifications === 'true') ? true : false;
                            $scope.params.active = (response.result.active === 'true') ? true : false;
                        }
                    });
                }
            };

            //# Update customer
            $scope.updateCustomer = function($valid) {
                if ($valid) {
                    if ($scope.params.phone) {
                        if ($scope.params.country_code.indexOf('+') === -1) {
                            $scope.params.country_code = '+' + $scope.params.country_code;
                        }
                        $scope.params.phone = $scope.params.phone.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                    }
                    customerResource.save({
                        'jsonrpc': '2.0',
                        'method': 'update',
                        'params': $scope.params
                    }, function(response) {
                        if (response.error) {
                            console.log(response.error);
                            if (angular.isDefined(response.error.message)) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrError(response.error, {});
                            }
                        } else {
                            $scope.toastrSuccess(response.result, {});
                            // $location.path('/ng/customer/list');
                        }
                    });
                }
            };

            //# Delete customer
            $scope.deleteCustomer = function(customerId) {
                if ($window.confirm('Do you really want to delete this customer?')) {
                    customerResource.delete({
                        method: 'delete',
                        id: customerId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result, {});
                            $scope.customerList();
                        }
                    });
                }
            };

            //#customer tab listings
            $scope.additionalTabs = {};
            $scope.additionalInfoTabs = function() {
                $scope.additionalTabs = [{
                    title: 'Delivery Addresses',
                    tabname: 'delivery-addresses',
                    url: 'app/customer/delivery_addresses_tpl.html'
                }, {
                    title: 'Credit Cards',
                    tabname: 'credit-cards',
                    url: 'app/customer/credit_cards_tpl.html'
                }, {
                    title: 'Order History',
                    tabname: 'order-history',
                    url: 'app/customer/order_history_tpl.html'
                }, {
                    title: 'Referred History',
                    tabname: 'referred-history',
                    url: 'app/customer/referred_history_tpl.html'
                }, {
                    title: 'Credit Log',
                    tabname: 'credit-log',
                    url: 'app/customer/credit_log_tpl.html'
                }, {
                    title: 'Item Feedback',
                    tabname: 'item-feedback',
                    url: 'app/customer/item_feedback_tpl.html'
                }, {
                    title: 'General Feedback',
                    tabname: 'general-feedback',
                    url: 'app/customer/general_feedback_tpl.html'
                }];
            };

            $scope.tabResult = {};
            $scope.getTabAdditionInfo = function(tab) {
                var tabName = tab.tabname;
                var customerId = $stateParams.id;
                if (customerId && tabName) {
                    customerResource.get({
                        method: tab.tabname,
                        id: customerId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.tabResult = response.result[1];
                            $scope.tabResult.tabName = tab.title;
                            $.get(tab.url).done(function(template) {
                                $compile(angular.element('#tabelement').html(template).contents())($scope);
                                $scope.$apply();
                            });
                        }
                    });
                }
            };

            //# Delete customer delivery address
            $scope.delDeliveryAddress = function(delvAddId, addIdx) {
                if ($window.confirm('Do you really want to delete this address?')) {
                    customerResource.delete({
                        method: 'delete-delivery-addresses',
                        id: delvAddId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.tabResult.splice(addIdx, 1);
                            $scope.toastrSuccess(response.result, {});
                        }
                    });
                }
            };

            //# Delete customer credit card
            $scope.delCreditCard = function(delvAddId, addIdx) {
                if ($window.confirm('Do you really want to delete this card?')) {
                    customerResource.delete({
                        method: 'delete-credit-card',
                        id: delvAddId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.tabResult.splice(addIdx, 1);
                            $scope.toastrSuccess(response.result, {});
                        }
                    });
                }
            };

            //When someone types country code instead of clicking the country
            $scope.updateCountryCode = function(event) {
                $scope.params.country_code = angular.element(event.target).val();
            };

            //Reset customer form by button click
            $scope.resetCustomerForm = function() {
                $scope.params.first_name = '';
                $scope.params.last_name = '';
                $scope.params.email = '';
                $scope.params.password = '';
                $scope.params.cpassword = '';
                $scope.params.phone = '';
                $scope.params.country_code = '+1';
                $scope.params.state_code = '';
                $scope.params.address = '';
                $scope.params.credit = '';
                $scope.params.onfleet_note = '';
                $scope.params.internal_note = '';
                // $scope.params.soldout_exp_time_item = '';
                // $scope.params.meal_period = [];
                // $scope.params.menu_category = [];
                // $scope.clearImage();
                $scope.customerForm.$setPristine();
                $scope.customerForm.$setUntouched();
                // console.log($scope.params);

            };

            $scope.fetchAllStates = function() {
                customerResource.get({
                    method: 'state-list'
                }, function(response) {
                    // console.log(response);
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        // console.log(response.result);
                        $scope.allStates = response.result;
                    }
                });
            };
            $scope.fetchAllCities = function() {
                customerResource.get({
                    method: 'city-list'
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
                    'ng.customer.add': function() {
                        $scope.params = { country_code: '+1' };
                        $scope.fetchAllStates();
                        $scope.fetchAllCities();
                    },
                    'ng.customer.edit': function() {
                        $scope.params = { country_code: '+1' };
                        $scope.fetchAllStates();
                        $scope.fetchAllCities();
                        $scope.getCustomerInfo();
                        $scope.additionalInfoTabs();
                        $scope.currentTab = 'delivery-addresses';
                        $scope.getTabAdditionInfo({
                            title: 'Delivery Addresses',
                            tabname: 'delivery-addresses',
                            url: 'app/customer/delivery_addresses_tpl.html'
                        });

                        $scope.isActiveTab = function(tabname) {
                            return tabname === $scope.currentTab;
                        };

                        $scope.onClickTab = function(tab) {
                            $scope.getTabAdditionInfo(tab);
                        };

                        $scope.onClickDeliveryAddress = function(delvAddId, addIdx) {
                            $scope.delDeliveryAddress(delvAddId, addIdx);
                        };

                        $scope.onClickCreditCard = function(crdtCardId, addIdx) {
                            $scope.delCreditCard(crdtCardId, addIdx);
                        };

                        $scope.overwritePhoneVerification = function(vstatus) {
                            if ($window.confirm('Are you sure to overwrite phone number verification status ?')) {
                                $scope.params.id = $stateParams.id;
                                customerResource.save({
                                    'jsonrpc': '2.0',
                                    'method': 'overwrite-phone-verification',
                                    'params': $scope.params
                                }, function(response) {
                                    if (response.error) {
                                        $scope.toastrError(response.error.message, {});
                                    } else {
                                        $scope.params.verified_phone = true;
                                        $scope.toastrSuccess(response.result, {});
                                    }
                                });
                            }
                        }
                    },
                    'ng.customer.list': function() {
                        // $scope.customerCount();
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
