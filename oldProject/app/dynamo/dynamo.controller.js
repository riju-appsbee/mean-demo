(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('DynamoController',
            ['$rootScope',
                '$stateParams',
                '$state',
                '$scope',
                '$http',
                '$timeout',
                '$location',
                'dynamoResource',
                '$window',
                function ($rootScope, $stateParams, $state, $scope, $http, $timeout, $location,
                        dynamoResource, $window) {

                    // set sidebar closed and body solid layout mode
                    $rootScope.settings.layout.pageContentWhite = true;
                    $rootScope.settings.layout.pageBodySolid = false;
                    $rootScope.settings.layout.pageSidebarClosed = false;

                    $scope.searchValue = '';
                    $scope.dynamoTables = null;

                    //Used for select dropdown
                    $scope.dynamoTblPrefix = '';
                    $scope.tablesNames = [];

                    $scope.selectedTable = '';

                    $scope.originalData = {}; //Is used for showing dynamo records
                    $scope.tblData = {}; //Is used for showing dynamo records

                    $scope.params = {
                        table: ''
                    };

                    //# Create table
                    $scope.importData = function (tbl) {
                        if (window.confirm('Do you really want to import table ' + tbl + '?')) {
                            $scope.toastrWarning('Importing table data ...', {});
                            
                            $scope.params.table = tbl;
                            dynamoResource.save({'jsonrpc': '2.0', method: 'import-tbl', 'params': $scope.params},
                            function (response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    $scope.toastrSuccess(response.result, {});
                                }
                            });
                        }
                    };


                    //# Delete table data
                    $scope.deleteData = function (tbl) {

                        if (window.confirm('Do you really want to delete ' + tbl + ' data?')) {
                            $scope.params.table = tbl;

                            dynamoResource.save({'jsonrpc': '2.0', method: 'delete-data', params: $scope.params},
                            function (response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    $scope.toastrSuccess(response.result, {});
                                }
                            });
                        }
                    };

                    //# Delete table
                    $scope.deleteTable = function (tbl) {
                        if (window.confirm('Do you really want to delete table ' + tbl + '?')) {
                            $scope.params.table = tbl;
                            dynamoResource.save({'jsonrpc': '2.0', method: 'delete-tbl', 'params': $scope.params},
                            function (response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    $scope.toastrSuccess(response.result, {});
                                    $scope.listAllTables();
                                }
                            });
                        }
                    };

                    //# Create table
                    $scope.createTable = function (tbl) {

                        if (tbl === undefined || tbl === '') {
                            $scope.toastrError('Please select a table', {});
                            return;
                        }

                        if (window.confirm('Do you really want to create table ' + tbl + '?')) {
                            $scope.params.table = tbl;
                            dynamoResource.save({'jsonrpc': '2.0', method: 'create-tbl', 'params': $scope.params},
                            function (response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    $scope.toastrSuccess(response.result, {});
                                    $scope.listAllTables();
                                }
                            });
                        }
                    };

                    //Fetch all data in a dynamo table
                    $scope.showData = function (tbl) {
                        $location.path('/ng/dynamo/show-data/' + tbl);
                    };

                    //Fetch all data in dynamo table
                    $scope.fetchTblData = function (tbl) {

                        $scope.params.table = tbl;

                        dynamoResource.save({'jsonrpc': '2.0', method: 'list', 'params': $scope.params},
                        function (response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                                $location.path('/ng/dynamo/list');

                            } else {

                                if (response.result.Count > 0) {
                                    $scope.tblData = response.result.Items;
                                    $scope.originalData = response.result.Items;
                                } else {
                                    $scope.toastrError('Sorry no record found.', {});
                                    $location.path('/ng/dynamo/list');
                                }
                            }
                        });
                    };

                    //For listing all dynamo tables
                    $scope.listAllTables = function () {
                        dynamoResource.get({method: 'list-tbls'}, function (response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.dynamoTables = response.result.TableNames;
                            }
                        });
                    };

                    //For listing all dynamo tables
                    $scope.getTblPrefix = function () {
                        dynamoResource.get({method: 'get-tbl-prefix'}, function (response) {
                            if (response.error) {

                                $scope.toastrError(response.error.message, {});
                            } else {

                                $scope.dynamoTblPrefix = response.result.tbl_prefix;
                                $scope.tablesNames = [
                                    {tblName: $scope.dynamoTblPrefix + 'customer', aliasName: 'Customer'},
                                    {tblName: $scope.dynamoTblPrefix + 'customer_credit_card', aliasName: 'Customer Credit Card'},
                                    {tblName: $scope.dynamoTblPrefix + 'customer_delivery_address', aliasName: 'Customer Delivery Address'}
                                ];

                                $scope.listAllTables();
                            }
                        });
                    };

                    $scope.searchTable = function () {

                        if ($scope.searchValue === '' || $scope.searchValue === undefined) {

                            $scope.tblData = $scope.originalData;

                        } else {

                            $scope.tblData = $scope.originalData;
                            var tempData = $scope.tblData;
                            var filteredData = [];
                            var rowKeys = [];

                            angular.forEach(tempData, function (value, key) {

                                angular.forEach(value, function (val, ky) {

                                    if ($scope.params.table === 'dev_v2_customer' || $scope.params.table === 'prod_customer') {
                                        if ((ky === 'eml' || ky === 'fnm' || ky === 'lnm') && val.S.indexOf($scope.searchValue) > -1) {//Filter on these keys
                                            rowKeys.push(key);
                                        }

                                    } else if ($scope.params.table === 'dev_v2_customer_credit_card' || $scope.params.table === 'prod_customer_credit_card') {
                                        
                                        if ((ky === 'crdn' || ky === 'crdu' || ky === 'crdt') && val.S.indexOf($scope.searchValue) > -1) {//Filter on these keys
                                            rowKeys.push(key);
                                        }
                                        
                                    } else if ($scope.params.table === 'dev_v2_customer_delivery_address' || $scope.params.table === 'prod_customer_delivery_address') {
                                        
                                        if ((ky === 'addr' || ky === 'scod' || ky === 'nte') && val.S.indexOf($scope.searchValue) > -1) {//Filter on these keys
                                            rowKeys.push(key);
                                        }
                                        
                                    }

                                });
                            });

                            rowKeys = _.uniq(rowKeys);

                            angular.forEach(tempData, function (value, key) {

                                if (_.contains(rowKeys, key)) {
                                    filteredData.push(tempData[key]);
                                }

                            });
                            
                            $scope.tblData = filteredData;
                        }

                    };

                    //Called on page load
                    $scope.init = function () {
                        //calling list if list page is called
                        var stateInit = {
                            'ng.dynamo.list': function () {
                                $scope.getTblPrefix();
                            },
                            'ng.dynamo.show-data': function () {
                                $scope.fetchTblData($state.params.tbl);
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