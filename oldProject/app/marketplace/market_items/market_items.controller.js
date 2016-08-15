(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('MarketItemsController', ['$rootScope',
        '$stateParams',
        '$state',
        '$scope',
        '$http',
        '$timeout',
        '$location',
        'MarketItemsService',
        '$window',
        'RTFoodJets',
        'Globalutc',
        'MarketItemSearchService',
        function($rootScope,
            $stateParams,
            $state,
            $scope,
            $http,
            $timeout,
            $location,
            MarketItemsService,
            $window,
            RTFoodJets,
            Globalutc,
            MarketItemSearchService) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.states = [
                { id: 'CA', value: 'California' },
                { id: 'AZ', value: 'Arizona' }
            ];

            // aws info
            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';
            $scope.noImagePath = 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image';

            //database elements
            $scope.params = {
                name: '',
                image: '',
                unit_price: 0.00,
                selling_price: 0.00,
                commission: 0.00,
                description: '',
                active: true,
                created_date: '',
                modified_date: ''
            };

            $scope.catid = $stateParams.catid;
            $scope.itemsCount = 0;
            $scope.marketItems = {};
            $scope.currentImage = '';
            $scope.storeid = $stateParams.storeid;


            //Fetch all market Items
            $scope.list = function() {
                $scope.loaderValue = true;
                $window.firebase.database().ref('market_item/' + $scope.catid).orderByChild('created_date').on('value', function(snapshot) {
                    $scope.loaderValue = false;
                    $scope.marketItems = snapshot.val();
                    if ($scope.marketItems) {
                        $scope.itemsCount = Object.keys(snapshot.val()).length;
                        $scope.error = {
                            status: false,
                            msg: ''
                        };
                    } else {
                        $scope.itemsCount = 0;
                        $scope.error = {
                            status: true,
                            msg: 'No records available.'
                        };
                    }
                    if (!$scope.$$phase) $scope.$apply();
                }, function(errorObject) {
                    $scope.toastrError(errorObject.message, {});
                });
            };


            //# Delete market Items code
            $scope.delete = function(id) {
                if ($window.confirm('Do you really want to delete this market item?')) {
                    if (id) {
                        firebase.database().ref('market_item/' + $scope.catid + "/" + id).remove(function(error) {
                            if (error) {
                                $scope.toastrError(error, {});
                            } else {

                                $scope.toastrSuccess('Market Item deleted successfully.', {});
                                $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                    } else {
                        $scope.toastrError("Opps! invalid market item", {});
                        $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    }
                }
            };


            //Add market Items
            $scope.add = function($valid) {

                if ($valid) {

                    $window.firebase.database().ref('market_item/' + $scope.catid).orderByChild('name').equalTo($scope.params.name).once('value', function(snapshot) {
                        if (snapshot.val()) {
                            $scope.toastrError('Market Item already exist with this name.', {});
                        } else {
                            // Adding data to $window.firebase satart
                            $scope.params.created_date = Globalutc.now();
                            $scope.params.modified_date = Globalutc.now();

                            $scope.imageUpload(function(response) {
                                if (response === true) {
                                    $window.firebase.database().ref('market_item/' + $scope.catid).push($scope.params).then(function(data) {
                                        $scope.toastrSuccess('Market Items added successfully.', {});
                                        $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                                        if (!$scope.$$phase) $scope.$apply();

                                    }).catch(function(error) {
                                        $scope.toastrError(error, {});
                                    });
                                }
                            });
                        }
                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                        $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    });

                }

            };

            // Search items
            $scope.search = function() {
                $scope.loaderValue = true;
                var textToSearch = $scope.searchText;
                if (textToSearch && textToSearch !== undefined) {
                    MarketItemSearchService.get({ q: textToSearch, path: 'market_item', child: '/' + $scope.catid }, function(response) {
                        $scope.loaderValue = false;
                        if (Object.keys(response.result).length) {
                            $scope.marketItems = response.result;
                            if ($scope.marketItems) {
                                $scope.itemsCount = Object.keys(response.result).length;
                            } else {
                                $scope.itemsCount = 0;
                            }
                            $scope.error = {
                                status: false,
                                msg: ''
                            };
                            if (!$scope.$$phase) $scope.$apply();
                        } else {
                            $scope.itemsCount = 0;
                            $scope.marketItems = {};
                            $scope.error = {
                                status: true,
                                msg: 'No records available.'
                            };
                        }
                    });
                } else {
                    $scope.list();
                }
            };


            $scope.imageUpload = function(callback) {
                var cb = callback || angular.noop;
                if ($scope.params.image.indexOf("base64") !== -1 && $scope.params.image !== undefined && $scope.params.image !== '') {
                    MarketItemsService.save({
                        'jsonrpc': '2.0',
                        'method': 'upload',
                        'params': $scope.params
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                            $scope.params.image = $scope.currentImage;
                            cb(false);
                        } else {
                            $scope.params.image = response.result;
                            cb(true);
                        }
                    });
                } else {
                    $scope.params.image = $scope.currentImage;
                    cb(true);
                }
            };


            //# get market Items info
            $scope.getInfo = function() {
                var marketItemsId = $stateParams.id;
                if (marketItemsId) {

                    firebase.database().ref('market_item/' + $scope.catid + '/' + marketItemsId).once('value').then(function(snapshot) {
                        var response = snapshot.val();

                        $scope.params = {
                            name: response.name,
                            image: response.image,
                            unit_price: response.unit_price,
                            selling_price: response.selling_price,
                            commission: response.commission,
                            description: response.description,
                            active: response.active,
                            created_date: response.created_date,
                            modified_date: response.modified_date
                        };
                        $scope.currentImage = response.image;
                        $scope.params.imagePath = $scope.cloud_url + response.image;
                        if (!$scope.$$phase) $scope.$apply();
                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                        $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    });
                } else {
                    $scope.toastrError("Opps! invalid market item", {});
                    $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                }
            };

            $scope.reset = function() {
                $scope.params.name = '';
                //$scope.params.image= '';
                $scope.params.unit_price = 0.00;
                $scope.params.selling_price = 0.00;
                $scope.params.commission = 0.00;
                $scope.params.description = '';
                $scope.params.active = true;
                $scope.clearImage();
            }

            //Edit market Items by ID
            $scope.update = function($valid) {
                if ($valid) {

                    $window.firebase.database().ref("market_item/" + $scope.catid).orderByChild('name').equalTo($scope.params.name).once("value", function(snapshot) {
                        var response = snapshot.val();
                        var ids = [];
                        angular.forEach(response, function(value, key) {
                            ids.push(key);
                        });
                        //console.log(ids);

                        var marketItemId = $stateParams.id;
                        //return false;
                        //console.log(ids.length+" "+ids.indexOf(marketItemId));
                        if (ids.length === 0 || (ids.length === 1 && ids.indexOf(marketItemId) > -1)) {
                            $scope.imageUpload(function(response) {
                                if (response === true) {
                                    // console.log($scope.params);
                                    $scope.params.modified_date = Globalutc.now();
                                    $window.firebase.database().ref('market_item/' + $scope.catid).child(marketItemId).update($scope.params, function(error) {
                                        if (error) {
                                            $scope.toastrError(error, {});
                                        } else {
                                            $scope.toastrSuccess('Market Item updated successfully.', {});
                                            $location.path('/ng/market-items/list/' + $scope.storeid + '/' + $scope.catid);
                                            if (!$scope.$$phase) $scope.$apply();
                                        }
                                    });
                                }
                            });
                        } else {
                            $scope.toastrError('Market Item already exist with this name.', {});
                        }

                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                        $location.path('/ng/market-items/list/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    });
                }
            };

            //Clear image while admin clicks remove button
            $scope.clearImage = function() {
                $scope.params.image = '';
                $scope.currentImage = '';
                $scope.params.imagePath = '';
                angular.element('.fileinput-preview img').attr('src', $scope.noImagePath);
            };

            $scope.init = function() {

                //calling list if list page is called
                var stateInit = {
                    'ng.market-items.list': function() {
                        $scope.list();
                    },
                    'ng.market-items.edit': function() {
                        //individual market Items details                        
                        $scope.getInfo();
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
