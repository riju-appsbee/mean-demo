(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('GlobalSettingsController', 
    ['$rootScope',
        '$stateParams',
        '$state', '$scope',
        '$location',
        'globalSettingsResource',
        '$uibModal',
        '$filter',
        function ($rootScope, $stateParams, $state, $scope, $location, globalSettingsResource, $uibModal, $filter) {
            
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            
            //For listing
            $scope.gSettings = {};
            
            //For status dropdown with different status option
//            $scope.settings_type = [
//                {id:'T', value:'T'},
//                {id:'NP', value:'NP'},
//                {id:'RCO', value:'RCO'},
//                {id:'REF', value:'REF'},
//                {id:'PNS', value:'PNS'},
//                {id:'G', value:'Global'}
//            ];
            
            //For status dropdown in edit
//            $scope.showStatus = function(type) {
//                var selected = $filter('filter')($scope.settings_type, {id: type});                
//                return (type && selected.length) ? selected[0].value : 'Not set';
//            };
            
            //For form data
            $scope.params = {
                name: '',
                value: '',
                description: '',
                settings_type: 'G',
            };
            
            // Modal For adding new settings

            $scope.animationsEnabled = true;

            $scope.openAddSettingFrm = function (size) {

              var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'addSetting.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                  params: function () {
                    return $scope.params;
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
            $scope.add = function(params) {

                globalSettingsResource.save({'jsonrpc': '2.0', 'method': 'add', 'params': $scope.params},
                function (response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.result, {});
                        //$location.path('/ng/settings/global');
                        $scope.params.name = '';
                        $scope.params.value = '';
                        $scope.params.description = '';                     
                        
                        $scope.gSettingCount();
                    }
                });
            };
            
            // Pagination setup strat
            $scope.currentPage = 1;
            $scope.maxSize = 1;
            $scope.pageChanged = function() {
                $scope.list();
            };
            // Pagination setup end
            
            // Count total settings
            $scope.gSettingCount = function() {
                globalSettingsResource.get({method: 'count',q: $scope.searchText}, function(response) {
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
            
            // Search settings
            $scope.search = function() {
                $scope.gSettingCount();
            };

            //Fetch all settings
            $scope.list = function () {
                globalSettingsResource.get({method: 'list', p: $scope.currentPage, q: $scope.searchText},
                function (response) {
                    if (response.error) {
                        $scope.toastrError(response.error, {});
                    } else {
                        $scope.gSettings = response.result;
                    }
                });
            };            

            //Edit settings by ID            
            $scope.update = function (id, field, data) {
                if (data && field && id) {
                    
                    var updateParams = {id: id, field: field, data: data};
                    
                    globalSettingsResource.save({'jsonrpc': '2.0', 'method': 'update', 'params': updateParams},
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
                    'ng.settings.global': function () {                        
                        $scope.gSettingCount();
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

    angular.module('FoodjetsApp').controller('ModalInstanceCtrl', [
        '$scope', '$modalInstance', 'params',
        function ($scope, $modalInstance, params) {

            $scope.params = params;            

            $scope.ok = function () {
                $modalInstance.close($scope.params);
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }]);

})();
