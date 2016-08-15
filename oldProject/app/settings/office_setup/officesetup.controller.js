(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('OfficeSetupController',
            ['$rootScope',
                '$stateParams',
                '$state',
                '$scope',
                '$location',
                'officeSetupResource',
                'restaurantResource',
                '$uibModal',
                '$filter',
                function ($rootScope, $stateParams, $state, $scope, $location, officeSetupResource, restaurantResource, $uibModal, $filter) {

                    // set sidebar closed and body solid layout mode
                    $rootScope.settings.layout.pageContentWhite = true;
                    $rootScope.settings.layout.pageBodySolid = false;
                    $rootScope.settings.layout.pageSidebarClosed = false;

                    $scope.selectedState = $stateParams.state || 'CA';

                    // get sate list
                    $scope.states = [
                        {id: 'CA', value: 'California'},
                        {id: 'AZ', value: 'Arizona'}
                    ];

                    // get market office list
                    $scope.listOfMarketOffice = {};
                    $scope.marketOfficeList = function (stateCode) {
                        restaurantResource.get({
                            method: 'market-office-list',
                            state: stateCode
                        }, function (response) {
                            if (response.error) {
                                $scope.listOfMarketOffice = {};
                            } else {
                                $scope.listOfMarketOffice = response.result[0];
                            }
                        });
                    };

                    $scope.changeState = function (stateCode) {
                        $scope.selectedState = stateCode;
                        $scope.marketOfficeList(stateCode);
                        $scope.ofcSettingCount();
                    };

                    //For listing
                    $scope.ofcSettings = {};

                    //For status dropdown in edit
                    $scope.showMktOfcDpDn = function (type) {

                        if ($scope.listOfMarketOffice.length > 0) {
                            var selected = $filter('filter')($scope.listOfMarketOffice, {id: type});
                            return (type && selected.length) ? selected[0].office_name : 'Not set';
                        }
                    };

                    //For form data
                    $scope.params = {
                        name: '',
                        value: '',
                        description: '',
                        market_office_id: '',
                    };

                    // Modal For adding new settings

                    $scope.animationsEnabled = true;

                    $scope.openAddSettingFrm = function (size) {

                        var modalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'addSetting.html',
                            controller: 'ModalInstanceCtrlOfc',
                            size: size,
                            resolve: {
                                params: function () {
                                    return $scope.params;
                                }, states: function () {
                                    return $scope.states;
                                }, selectedState: function () {
                                    return $scope.selectedState;
                                }
                            }
                        });

                        modalInstance.result.then(function (params) {
                            $scope.add(params);
                        }, function () {
                            //console.log('Modal dismissed at: ' + new Date());
                        });
                    };

                    $scope.toggleAnimation = function () {
                        $scope.animationsEnabled = !$scope.animationsEnabled;
                    };

                    // Modal End for adding new settings


                    //Add setting
                    $scope.add = function (params) {

                        officeSetupResource.save(
                                {'jsonrpc': '2.0', 'method': 'add', 'state': $scope.selectedState, 'params': $scope.params},
                        function (response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.toastrSuccess(response.result, {});
                                $scope.params.name = '';
                                $scope.params.value = '';
                                $scope.params.description = '';
                                $scope.params.market_office_id = '';

                                $scope.ofcSettingCount();
                            }
                        });
                    };

                    // Pagination setup strat
                    $scope.currentPage = 1;
                    $scope.pageChanged = function () {
                        $scope.list();
                    };
                    // Pagination setup end

                    // Count total settings
                    $scope.ofcSettingCount = function () {
                        officeSetupResource.get(
                                {method: 'count', 'state': $scope.selectedState, q: $scope.searchText},
                        function (response) {
                            if (response.error) {
                                $scope.ofcSettings = {};
                                $scope.listOfMarketOffice = {};
                                $scope.toastrError(response.error.message, {});
                            } else {
                                $scope.totalItems = response.result.count;
                                $scope.numPerPage = response.result.numPerPage;
                                $scope.maxSize = response.result.maxSize;

                                $scope.list();
                            }
                        });
                    };

                    // Search settings
                    $scope.search = function () {
                        $scope.ofcSettingCount();
                    };

                    //Fetch all settings
                    $scope.list = function () {
                        officeSetupResource.get(
                                {method: 'list', 'state': $scope.selectedState, p: $scope.currentPage, q: $scope.searchText},
                        function (response) {
                            if (response.error) {
                                $scope.toastrError(response.error, {});
                            } else {
                                $scope.ofcSettings = response.result;
                            }
                        });
                    };

                    //Edit settings by ID            
                    $scope.update = function (id, field, data) {
                        if (data && field && id) {

                            var updateParams = {id: id, field: field, data: data};

                            officeSetupResource.save(
                                    {'jsonrpc': '2.0', 'method': 'update', 'state': $scope.selectedState, 'params': updateParams},
                            function (response) {
                                if (response.error) {
                                    $scope.toastrError(response.error.message, {});
                                } else {
                                    $scope.toastrSuccess(response.result, {});
                                }
                            });
                        }
                    };

                    $scope.init = function () {
                        //calling list if list page is called
                        var stateInit = {
                            'ng.settings.office-setup': function () {
                                //$scope.ofcSettingCount();    
                                $scope.changeState($scope.selectedState);
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


//Used for opening model popup
(function () {
    'use static';

    angular.module('FoodjetsApp').controller('ModalInstanceCtrlOfc', [
        '$scope', '$modalInstance', 'params', 'states', 'selectedState', 'restaurantResource',
        function ($scope, $modalInstance, params, states, selectedState, restaurantResource) {

            //Passed variables
            $scope.params = params;
            $scope.states = states;
            $scope.selectedState = selectedState;

            $scope.ok = function () {
                $modalInstance.close($scope.params);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            //Called on state change
            $scope.changeState = function (stateCode) {
                $scope.selectedState = stateCode;
                $scope.marketOfficeList(stateCode);
            };

            $scope.listOfMarketOffice = {};
            $scope.marketOfficeList = function (stateCode) {
                restaurantResource.get({
                    method: 'market-office-list',
                    state: stateCode
                }, function (response) {
                    if (response.error) {
                        $scope.listOfMarketOffice = {};
                    } else {
                        $scope.listOfMarketOffice = response.result[0];
                    }
                });
            };

            //Called on from load
            $scope.changeState(selectedState);

        }]);

})();