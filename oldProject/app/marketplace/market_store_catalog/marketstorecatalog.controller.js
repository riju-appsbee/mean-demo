(function () {
    'use strict';
    angular.module('FoodjetsApp').controller('MarketStoreCatalogController', ['$rootScope',
        '$scope',
        '$stateParams',
        '$location',
        '$state',
        'RTFoodJets',
        'Globalutc',
        'mrktCatSearchService',
        function ($rootScope,
                $scope,
                $stateParams,
                $location,
                $state,
                RTFoodJets,
                Globalutc,
                mrktCatSearchService) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;


            //database elements
            $scope.params = {
                catalog_name: '',
                store_categories: '',
                active: false,
                created_at: '',
                updated_at: ''
            };

            $scope.storeid = $stateParams.storeid;
            $scope.storeInfo = {name: ''};

            $scope.listData = {};

            // Pagination setup start
//            $scope.numPerPage = 2;
//            $scope.currentPage = 1;
//            $scope.pageChanged = function() {
//                $scope.mrktCatList();
//            };
            // Pagination setup end

            // Count total listData
            $scope.mrktCatCount = function () {
                firebase.database().ref('market_store_catalog/' + $scope.storeid).on('value', function (snapshot) {
                    $scope.totalItems = snapshot.numChildren();
                    $scope.mrktCatList();
                }, function (error) {

                    $scope.toastrError('Sorry! Unable to count market store catalog.', {});
                    $location.path('/ng/dashboard');
                    if (!$scope.$$phase)
                        $scope.$apply();
                });
            };



            //Fetch list of market store catalog
            $scope.mrktCatList = function () {

                firebase.database().ref('market_store_catalog/' + $scope.storeid).orderByChild('catalog_name').on('value', function (snapshot) {

                    var response = [];

                    angular.forEach(snapshot.val(), function (value, key) {
                        value.id = key;
                        response.push(value);
                    });
                    $scope.listData = response;

                    if (!$scope.$$phase)
                        $scope.$apply();
                }, function (error) {

                    $scope.toastrError('Sorry! Unable to count market store catalog.', {});
                    $location.path('/ng/dashboard');
                    if (!$scope.$$phase)
                        $scope.$apply();
                });

            };
            
            
            // Search catalog
            $scope.search = function() {
                var textToSearch = $scope.searchText;
                if(textToSearch && textToSearch !== undefined) {                
                    mrktCatSearchService.get({q:textToSearch , path: 'market_store_catalog'},function(response){
                        if(response.result) {                            
                            $scope.listData = response.result;
                            if($scope.listData){
                                $scope.totalItems = Object.keys(response.result).length;
                            } else {
                                $scope.totalItems = 0;
                            }
                            if (!$scope.$$phase) $scope.$apply();
                        } 
                    }); 
                } else {
                    $scope.mrktCatList();
                }        
            };

            //Add a new Unable to count market store catalog
            $scope.addMrktCat = function ($valid) {
                if ($valid) {
                    var requestObject = {'catalog_name': $scope.params.catalog_name, 'active': $scope.params.active};

                    var store_categories = [];
                    angular.forEach($scope.params.store_categories, function (value, key) {
                        store_categories.push(value.text);
                    });
                    requestObject.store_categories = store_categories;
                    requestObject.created_at = Globalutc.now();
                    requestObject.updated_at = Globalutc.now();

                    firebase.database().ref('market_store_catalog/' + $scope.storeid).push(requestObject).then(function () {

                        $scope.toastrSuccess('You have successfully added market store catalog.', {});
                        $location.path('/ng/market-store-catalog/list/' + $scope.storeid);
                        if (!$scope.$$phase)
                            $scope.$apply();

                    }).catch(function (error) {
                        $scope.toastrError('Sorry! can not add market store catalog.', {});
                    });

                }
            };

            //Fetch details of a Unable to count market store catalog by ID before updation
            $scope.getMrktCatInfo = function () {

                var id = $stateParams.id;
                if (id) {

                    firebase.database().ref('market_store_catalog/' + $scope.storeid + '/' + id).once('value').then(function (snapshot) {

                        $scope.params.id = snapshot.key;
                        $scope.params.catalog_name = snapshot.val().catalog_name;
                        $scope.params.store_categories = snapshot.val().store_categories;
                        $scope.params.active = (snapshot.val().active === true) ? true : false;
                        $scope.params.created_at = snapshot.val().created_at;
                        $scope.params.updated_at = snapshot.val().updated_at;

                        if (!$scope.$$phase)
                            $scope.$apply();

                    }).catch(function (err) {

                        $scope.toastrError(err, {});
                        $location.path('/ng/market-store-catalog/list/' + $scope.storeid);

                    });

                } else {
                    $scope.toastrError('Unauthorized access!', {});
                    $location.path('/ng/market-store-catalog/list/' + $scope.storeid);
                }
            };

            //Update details of the menu if everything is okay
            $scope.updateMrktCat = function ($valid) {
                if ($valid) {
                    var requestObject = {'catalog_name': $scope.params.catalog_name, 'active': $scope.params.active};

                    var store_categories = [];
                    angular.forEach($scope.params.store_categories, function (value, key) {
                        store_categories.push(value.text);
                    });
                    requestObject.store_categories = store_categories;
                    requestObject.updated_at = Globalutc.now();

                    firebase.database().ref('market_store_catalog/' + $scope.storeid + '/' + $scope.params.id).update(requestObject).then(function () {
                        $scope.toastrSuccess('You have successfully updated market store catalog.', {});
                        $location.path('/ng/market-store-catalog/list/' + $scope.storeid);
                        if (!$scope.$$phase)
                            $scope.$apply();

                    }).catch(function (error) {

                        $scope.toastrError('Can not update the record due to some error.', {});
                    });


                }
            };

            //delete 
            $scope.deleteMrktCat = function (id) {
                if (window.confirm('Do you really want to delete this market store catalog?')) {

                    var deleteItems = function (cb) {

                        firebase.database().ref('market_item/' + id).remove(function (error) {
                            if (error) {
                                cb(error, null);
                            } else {
                                cb(null);
                            }
                        });
                    };


                    var deleteCat = function (cb) {

                        firebase.database().ref('market_store_catalog/' + $scope.storeid + '/' + id).remove(function (error) {
                            if (error) {
                                cb(error, null);
                            } else {
                                cb(null);
                            }
                        });
                    };

                    async.waterfall([deleteItems, deleteCat], function (err, result) {
                        if (err !== null) {
                            //$scope.toastrError('Information can not be deleted.', {});
                            $scope.toastrError(err, {});
                            $location.path('/ng/alcohol-store-catalog/list/' + $scope.storeid);

                        } else {
                            $scope.toastrSuccess('You have successfully deleted the market store catalog.', {});
                        }
                    });

                }
            };

            //Get store info
            $scope.getStoreInfo = function () {

                firebase.database().ref('market_store/' + $scope.storeid).once('value').then(function (snapshot) {
                    $scope.storeInfo.name = snapshot.val().name;
                    if (!$scope.$$phase)
                        $scope.$apply();

                }).catch(function (err) {
                    $scope.toastrError('Sorry, this store does not exist.', {});

                });

            }

            //Initializing controller functions
            $scope.init = function () {

                if ($scope.storeid === '' || $scope.storeid === undefined) {
                    $scope.toastrError('Please select a store.', {});
                    $location.path('/ng/market-store/list');
                }

                $scope.getStoreInfo();

                var stateInit = {
                    'ng.market-store-catalog.list': function () {
                        $scope.mrktCatCount();
                    },
                    'ng.market-store-catalog.edit': function () {
                        $scope.getMrktCatInfo();
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