(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('EmployeeController', [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        '$location',
        '$stateParams',
        '$state',
        '$window',
        '$compile',
        'marketOffice',
        'employeeService',
        function($rootScope, $scope, $http, $timeout, $location,
            $stateParams, $state, $window, $compile, marketOffice, employeeService) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            var self = this;
            $scope.info = [];
            $scope.marketOffices = {};
            $scope.roles = {};
            $scope.params = {};

            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];
            //get market office of based on state
            $scope.marketOffice = [];
            $scope.getMarketOffices = function(state) {
                $scope.params.market_office_id = '';
                marketOffice.getAll(state, function(err, response) {
                    if (err === true) {
                        $scope.marketOffice = [];
                        $scope.toastrError('No Market Office Found Under This State.', {});
                    } else {
                        response.push({ id: '', office_name: 'All' });
                        console.log(response);
                        $scope.marketOffice = response;
                    }

                });
            };

            // Pagination setup strat
            $scope.currentPage = 1;
            $scope.pageChanged = function() {
                $scope.employeeList();
            };
            // Pagination setup end

            // Count total employee
            $scope.employeeCount = function() {
                employeeService.get({
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

                        $scope.employeeList();
                    }
                });
            };

            $scope.employeeList = function() {
                console.log($scope.searchText);
                employeeService.get({
                    method: 'list',
                    p: $scope.currentPage,
                    q: $scope.searchText,
                    ms: $scope.params.market_office_state_code || '',
                    mo: $scope.params.market_office_id || ''
                }, function(response) {
                    if (response.result) {
                        $scope.info = response.result;
                        $scope.loderValue = false;
                    }
                });
            };

            // getting all market office depending on states
            $scope.getMarketOffice = function(stateCode) {
                $scope.selectedState = stateCode;
                $scope.marketOffices = {};

                marketOffice.getAll($scope.selectedState, function(err, response) {
                    if (err === false) {
                        $scope.marketOffices = response;
                    }
                });
            };

            $scope.fetchAllRoles = function() {
                employeeService.get({ method: 'roles' }, function(response) {
                    if (response.result) {
                        $scope.roles = response.result;
                    }
                });
            };

            $scope.addEmployeeForm = function() {
                async.waterfall([
                        function validateEmail(callback) {
                            var email = $scope.params.email;
                            employeeService.save({ 'jsonrpc': '2.0', 'method': 'checkEmail', 'params': email }, function(response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    callback();
                                }
                            });
                        },
                        function addEmployeeDetails(callback) {
                            var employeeObj = {};

                            employeeObj = $scope.params;

                            if (employeeObj.phone) {
                                employeeObj.phone = employeeObj.phone.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                            }

                            var EmpId = employeeObj.employee_role_id.id;
                            delete employeeObj.employee_role_id;
                            employeeObj.employee_role_id = EmpId;

                            var stateId = employeeObj.estate_code.id;
                            delete employeeObj.estate_code;
                            employeeObj.estate_code = stateId;

                            var mktOfcId = employeeObj.market_office_id.id;
                            delete employeeObj.market_office_id;
                            employeeObj.market_office_id = mktOfcId;

                            employeeService.save({ 'jsonrpc': '2.0', 'method': 'add', 'params': employeeObj }, function(response) {
                                if (response.error) {
                                    callback(response.error.message, null);
                                } else {
                                    callback(null, response.result);
                                }
                            });
                        }
                    ],
                    function(error, result) {
                        if (error) {
                            $scope.toastrError('Can not added employee due to some error with ===> ' + error, {});
                        } else {
                            $scope.toastrSuccess(result, {});
                            $location.path('/ng/employee/list');
                        }
                    }
                );
            };

            $scope.getEmployeeDetails = function() {
                var employeeId = $stateParams.id;
                $scope.params = $scope.params || {};
                employeeService.save({
                    'jsonrpc': '2.0',
                    'method': 'employee_info',
                    'params': { 'employeeId': employeeId }
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        //console.log(response.result);
                        $scope.params = response.result;
                        $scope.params.password = '';
                        if ($scope.params.employee_market_office.state_code) {
                            $scope.getMarketOffice($scope.params.employee_market_office.state_code);
                        }
                    }
                });

            };

            $scope.editEmployeeForm = function() {
                async.waterfall([
                        function validateEmail(callback) {
                            var obj = {};
                            obj.email = $scope.params.email;
                            obj.id = $stateParams.id;
                            employeeService.save({ 'jsonrpc': '2.0', 'method': 'checkUpdateEmail', 'params': obj }, function(response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    callback();
                                }
                            });
                        },
                        function updateEmployeeDetails(callback) {
                            var employeeObj = {};

                            employeeObj = $scope.params;

                            if (employeeObj.phone) {
                                employeeObj.phone = employeeObj.phone.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                            }

                            var stateId = employeeObj.employee_market_office.state_code;
                            employeeObj.estate_code = stateId;

                            var mktOfcId = employeeObj.employee_market_office.market_office_id;
                            delete employeeObj.employee_market_office;
                            employeeObj.market_office_id = mktOfcId;

                            employeeService.save({ 'jsonrpc': '2.0', 'method': 'update', 'params': employeeObj }, function(response) {
                                if (response.error) {
                                    callback(response.error.message, null);
                                } else {
                                    callback(null, response.result);
                                }
                            });
                        }
                    ],
                    function(error, result) {
                        if (error) {
                            $scope.toastrError('Can not updated employee due to some error with ===> ' + error, {});
                        } else {
                            $scope.toastrSuccess(result, {});
                            $location.path('/ng/employee/list');
                        }
                    }
                );
            };

            $scope.deleteEmployee = function(employeeId) {
                var self = this;
                if ($window.confirm('Do you really want to delete this employee?')) {
                    employeeService.delete({ method: 'delete', id: employeeId }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.init();
                            $scope.toastrSuccess(response.result, {});
                        }
                    });
                }
            };
            $scope.searchEmployee = function() {
                // $scope.employeeCount();
                // if (!!$scope.params.market_office_state_code) {
                    $scope.employeeCount();
                // } else {
                //     $scope.toastrError('Please select state.', {});
                // }
            }

            $scope.init = function() {
                var stateInit = {
                    'ng.employee.listing': function() {
                        // $scope.employeeCount();
                    },
                    'ng.employee.add': function() {
                        $scope.fetchAllRoles();
                    },
                    'ng.employee.edit': function() {
                        $scope.getEmployeeDetails();
                        $scope.fetchAllRoles();
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
