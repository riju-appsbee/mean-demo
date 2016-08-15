(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('AlcoholItemsController', ['$rootScope',
        '$stateParams',
        '$state',
        '$scope',
        '$http',
        '$timeout',
        '$location',
        'AlcoholItemsService',
        '$window',
        'RTFoodJets',
        'Globalutc',
        'AlcoholItemSearchService',
        function($rootScope,
            $stateParams,
            $state,
            $scope,
            $http,
            $timeout,
            $location,
            AlcoholItemsService,
            $window,
            RTFoodJets,
            Globalutc,
            AlcoholItemSearchService) {

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
                active: false,
                created_date: '',
                modified_date: ''
            };

            $scope.catid = $stateParams.catid;
            $scope.itemsCount = 0;
            $scope.alcoholItems = {};
            $scope.currentImage = '';
            $scope.storeid = $stateParams.storeid;


            //Fetch all alcohol Items
            $scope.list = function() {
                $scope.loaderValue = true;
                $window.firebase.database().ref('alcohol_item/' + $scope.catid).orderByChild('created_date').on('value', function(snapshot) {
                    $scope.loaderValue = false;
                    $scope.alcoholItems = snapshot.val();
                    if ($scope.alcoholItems) {
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

            // Search items
            $scope.search = function() {
                $scope.loaderValue = true;
                var textToSearch = $scope.searchText;
                if (textToSearch && textToSearch !== undefined) {
                    AlcoholItemSearchService.get({ q: textToSearch, path: 'alcohol_item', child: '/' + $scope.catid }, function(response) {
                        // console.log(response.result);
                        $scope.loaderValue = false;
                        if (Object.keys(response.result).length) {
                            $scope.alcoholItems = response.result;
                            if ($scope.alcoholItems) {
                                $scope.itemsCount = Object.keys(response.result).length;
                            } else {
                                $scope.itemsCount = 0;
                            }
                            $scope.error = {
                                status: false,
                                msg: ''
                            };

                        } else {
                            $scope.itemsCount = 0;
                            $scope.alcoholItems = {};
                            $scope.error = {
                                status: true,
                                msg: 'No records found'
                            };
                        }
                        if (!$scope.$$phase) $scope.$apply();
                    });
                } else {
                    $scope.list();
                }
            };


            //# Delete alcohol Items code
            $scope.delete = function(id) {
                if ($window.confirm('Do you really want to delete this alcohol item?')) {
                    if (id) {
                        firebase.database().ref('alcohol_item/' + $scope.catid + "/" + id).remove(function(error) {
                            if (error) {
                                $scope.toastrError(error, {});
                            } else {

                                $scope.toastrSuccess('Alcohol Item deleted successfully.', {});
                                $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                    } else {
                        $scope.toastrError("Opps! invalid alcohol item", {});
                        $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    }
                }
            };


            //Add alcohol Items
            $scope.add = function($valid) {

                if ($valid) {

                    $window.firebase.database().ref('alcohol_item/' + $scope.catid).orderByChild('name').equalTo($scope.params.name).once('value', function(snapshot) {
                        if (snapshot.val()) {
                            $scope.toastrError('Alcohol Item already exist with this name.', {});
                        } else {
                            // Adding data to $window.firebase satart
                            $scope.params.created_date = Globalutc.now();
                            $scope.params.modified_date = Globalutc.now();

                            $scope.imageUpload(function(response) {
                                if (response === true) {
                                    $window.firebase.database().ref('alcohol_item/' + $scope.catid).push($scope.params).then(function(data) {
                                        $scope.toastrSuccess('Alcohol Items added successfully.', {});
                                        $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
                                        if (!$scope.$$phase) $scope.$apply();

                                    }).catch(function(error) {
                                        $scope.toastrError(error, {});
                                    });
                                }
                            });
                        }
                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                        $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    });

                }

            };



            $scope.imageUpload = function(callback) {
                var cb = callback || angular.noop;
                if ($scope.params.image !== undefined && $scope.params.image !== '' && $scope.params.image.indexOf("base64") !== -1) {
                    AlcoholItemsService.save({
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


            //# get alcohol Items info
            $scope.getInfo = function() {
                var alcoholItemsId = $stateParams.id;
                if (alcoholItemsId) {

                    firebase.database().ref('alcohol_item/' + $scope.catid + '/' + alcoholItemsId).once('value').then(function(snapshot) {
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
                        $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    });
                } else {
                    $scope.toastrError("Opps! invalid alcohol item", {});
                    $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
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

            //Edit alcohol Items by ID
            $scope.update = function($valid) {
                if ($valid) {

                    $window.firebase.database().ref("alcohol_item/" + $scope.catid).orderByChild('name').equalTo($scope.params.name).once("value", function(snapshot) {
                        var response = snapshot.val();
                        var ids = [];
                        angular.forEach(response, function(value, key) {
                            ids.push(key);
                        });

                        var alcoholItemId = $stateParams.id;

                        if (ids.length === 0 || (ids.length === 1 && ids.indexOf(alcoholItemId) > -1)) {
                            $scope.imageUpload(function(response) {
                                if (response === true) {
                                    $scope.params.modified_date = Globalutc.now();
                                    $window.firebase.database().ref('alcohol_item/' + $scope.catid).child(alcoholItemId).update($scope.params, function(error) {
                                        if (error) {
                                            $scope.toastrError(error, {});
                                        } else {
                                            $scope.toastrSuccess('Alcohol Item updated successfully.', {});
                                            $location.path('/ng/alcohol-items/list/' + $scope.storeid + '/' + $scope.catid);
                                            if (!$scope.$$phase) $scope.$apply();
                                        }
                                    });
                                }
                            });
                        } else {
                            $scope.toastrError('Alcohol Item already exist with this name.', {});
                        }

                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                        $location.path('/ng/alcohol-items/list/' + $scope.catid);
                        if (!$scope.$$phase) $scope.$apply();
                    });
                }
            };

            //Clear image while admin clicks remove button
            $scope.clearImage = function() {
                $scope.params.image = '';
                $scope.params.imagePath = '';
                $scope.currentImage = '';
                angular.element('.fileinput-preview img').attr('src', $scope.noImagePath);
            };

            $scope.init = function() {

                //calling list if list page is called
                var stateInit = {
                    'ng.alcohol-items.list': function() {
                        $scope.list();
                    },
                    'ng.alcohol-items.edit': function() {
                        //individual alcohol Items details                        
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
