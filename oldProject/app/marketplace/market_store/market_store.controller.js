(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('MarketStoreController', ['$rootScope',
        '$stateParams',
        '$state',
        '$modal',
        '$window',
        '$scope',
        '$http',
        '$location',
        'MarketStoreService',
        'marketOffice',
        'marketOfficeCityService',
        'zoneService',
        'RTFoodJets',
        'Globalutc',
        'marketStoreSearchService',
        'restaurantResource',
        function(
            $rootScope, $stateParams, $state, $modal, $window, $scope, $http,
            $location, MarketStoreService, marketOffice,
            marketOfficeCityService, zoneService,
            RTFoodJets, Globalutc, marketStoreSearchService, restaurantResource) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            // All object initialization
            $scope.marketOffices = {};
            $scope.marketOfficeCities = {};
            $scope.deliveryZones = {};
            $scope.opening_hours = {};
            $scope.place = {};
            $scope.info = {};
            $scope.storeId = '';
            $scope.searchText = '';
            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';

            //Error
            $scope.errors = {
                status: false,
                msg: ''
            };

            // get sate list
            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];

            //########## start time and end time value assign with current time
            var currentD = new Date().toString();
            // $scope.start_time   = moment(currentD).utc().format('HH:mm');
            $scope.start_time = moment(currentD).utc().format('YYYY-MM-DD HH:mm:ss');
            $scope.end_time = moment(currentD).utc().format('YYYY-MM-DD HH:mm:ss');
            // $scope.end_time     = moment(currentD).utc().format('HH:mm');
            //$scope.start_time   = new Date().toUTCString();
            //$scope.end_time     = new Date().toUTCString();

            //$scope.start_time   = currentD;
            //$scope.end_time     = currentD;

            //console.log(currentD);

            //########## hour and minute steps declaration
            $scope.hstep = 1;
            $scope.mstep = 15;

            //# Timepicker steps
            $scope.options = {
                hstep: [1, 2, 3],
                mstep: [1, 5, 10, 15, 25, 30]
            };

            $scope.toggleMode = function() {
                $scope.ismeridian = !$scope.ismeridian;
            };

            //# Opening Days
            $scope.days = {
                sun: 'Sunday',
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday',
                thu: 'Thursday',
                fri: 'Friday',
                sat: 'Saturday'
            };

            //############## These function will call when go to market store add page starts #########

            // This function will initiate start time and end time for all days
            $scope.allFunctionsDeclaration = function() {
                Object.keys($scope.days).forEach(function(k, v) {
                    var temp = {};
                    var
                        temp = {
                            start_time: $scope.start_time,
                            end_time: $scope.end_time,
                        };
                    $scope.opening_hours[k] = temp;
                });
                if (!$scope.$$phase) $scope.$apply();



            };

            // call this function when start time of any day changed
            $scope.changed_start_time = function(k, val) {
                $scope.opening_hours[k].start_time = moment(val).format('YYYY-MM-DD HH:mm:ss');
                if (!$scope.$$phase) $scope.$apply();
            };

            // call this function when end time of any day changed
            $scope.changed_end_time = function(k, val) {
                $scope.opening_hours[k].end_time = moment(val).format('YYYY-MM-DD HH:mm:ss');
                if (!$scope.$$phase) $scope.$apply();
            };

            // all delivery zones for zone information
            $scope.getAllDeliveryZones = function() {
                MarketStoreService.get({
                    method: 'getAllDeliveryZones'
                }, function(response) {
                    if (response.result) {
                        $scope.info = response.result;
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

            $scope.getMarketOfficeCity = function(marketOfficeId) {
                $scope.selectedOffice = marketOfficeId;
                marketOfficeCityService.get({
                    'method': 'all',
                    'state': $scope.selectedState,
                    'mofid': $scope.selectedOffice
                }, function(response) {
                    $scope.info = {};
                    if (response.result) {
                        $scope.marketOfficeCities = response.result;
                    }
                });
            };

            $scope.getDeliveryZones = function() {
                zoneService.get({
                    'method': 'all',
                    'state': $scope.selectedState,
                    'mofid': $scope.selectedOffice
                }, function(response) {
                    $scope.info = {};
                    if (response.result) {
                        $scope.deliveryZones = response.result;
                    }
                });
            };

            $scope.placeChanged = function() {
                var places = this.getPlace();
                $scope.place = {
                    'lat': places.geometry.location.lat(),
                    'lng': places.geometry.location.lng()
                };
            };
            //################ These function will call when go to market store add page ends ##########

            $scope.addMarketStore = function(params) {
                if (params) {
                    async.waterfall([
                            //@@@@@@@@@@@@ This callback is for storing logo to AWS and then to firebase
                            function(callback) {
                                if ($scope.params.logo !== undefined && $scope.params.logo !== '') {
                                    MarketStoreService.save({
                                        'jsonrpc': '2.0',
                                        'method': 'upload',
                                        'params': $scope.params
                                    }, function(response) {
                                        if (response.error) {
                                            callback(response.error.message, null);
                                        } else {
                                            callback(null, response.result);
                                        }
                                    });
                                } else {
                                    callback(null, '');
                                }
                            },
                            //@@@@@@@@@@@@ This callback is for adding store data to firebase
                            function(logo, callback) {
                                var zoneHash = {};
                                var storeCat = {};
                                var state_code = params.state_code.id;
                                delete params.state_code;
                                params.state_code = state_code;

                                var market_office_city = params.market_office_city;
                                delete params.market_office_city;
                                params.market_office_city = market_office_city;

                                var market_office = params.market_office;
                                delete params.market_office;
                                params.market_office = market_office;

                                params.zone_hash.forEach(function(v, k) {
                                    zoneHash[v] = true;
                                });

                                params.sub_category.forEach(function(v, k) {
                                    storeCat[k] = v.text;
                                });

                                params.created_at = Globalutc.now();
                                params.modified_at = Globalutc.now();

                                params.zone = zoneHash;
                                params.category = storeCat;
                                //params.opening_hours = $scope.opening_hours;

                                delete params.zone_hash;
                                delete params.sub_category;

                                if (params.contact_no) {
                                    $scope.params.contact_no = $scope.params.contact_no.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                                }

                                params.logo = logo;
                                // console.log(params);return;
                                var ref = firebase.database().ref("market_store");
                                ref.push(params).then(function(data) {
                                    // console.log(data);
                                    callback(null, data.key);
                                }).catch(function(error) {
                                    // console.log(error);
                                    callback(error, null);
                                });
                            },
                            //@@@@@@@@@@@@ This callback is for adding opening hours to firebase
                            function callback(storeId, callback) {
                                var ref = firebase.database().ref("market_store_opening_hours/" + storeId);
                                ref.set($scope.opening_hours).then(function(data) {
                                    callback(null, storeId);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },
                            //@@@@@@@@@@@@ This callback is for adding lat , lng to geocode
                            function callback(storeId, callback) {
                                //# adding lat,long to geoFire
                                if ($scope.place) {
                                    var geoFire = new GeoFire(firebase.database().ref("market_store_location"));
                                    geoFire.set(storeId, [$scope.place.lat, $scope.place.lng]).then(function() {
                                        callback(null, "Provided key has been added to GeoFire");
                                    }, function(error) {
                                        callback(error, null);
                                    });
                                }
                            }
                        ],
                        function(error, result) {
                            if (error) {
                                $scope.toastrError('Can not added the store due to some error with ===> ' + error, {});
                            } else {
                                $scope.toastrSuccess('You have successfully added the store.', {});
                                $location.path('/ng/market-store/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                }
            };

            $scope.info = $scope.infoDb = {}
            $scope.marketStoreList = function() {
                $scope.loaderValue = true;
                var ref = firebase.database().ref("market_store");
                ref.on('value', function(data) {
                    $scope.loaderValue = false;
                    $scope.infoDb = $scope.info = data.val();
                    $scope.totalUsers = Object.keys($scope.info).length;
                    if (!$scope.$$phase) $scope.$apply();
                });
            };

            $scope.marketStoreGlobalSearch = function() {
                $scope.loaderValue = true;
                if ($scope.searchText !== '') {
                    var textToSearch = $scope.searchText;
                    marketStoreSearchService.get({
                        q: textToSearch,
                        path: 'market_store'
                    }, function(response) {
                        $scope.loaderValue = false;
                        if (Object.keys(response.result).length) {
                            $scope.errors = {
                                status: false,
                                msg: ''
                            };
                            $scope.info = response.result;
                            $scope.totalUsers = Object.keys($scope.info).length;

                        } else {
                            $scope.info = {};
                            $scope.errors = {
                                status: true,
                                msg: 'No record available'
                            };
                        }
                        if (!$scope.$$phase) $scope.$apply();
                    });
                }
            };

            $scope.searchMarketStoreList = function() {
                if (/\S+/.test($scope.searchText)) {
                    $scope.info = _.reduce($scope.infoDb, function(o, k, i) {
                        if (k.name.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                            k.contact_no.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                            k.email.toLowerCase().includes($scope.searchText.toLowerCase())) {
                            o[i] = k;
                        }
                        return o;
                    }, {});
                    if (!$scope.$$phase) $scope.$apply();
                } else {
                    $scope.info = $scope.infoDb;
                }
                $scope.totalUsers = Object.keys($scope.info).length;
            };

            $scope.getMarketStoreInfo = function() {
                var storeId = $stateParams.id;
                $scope.storeId = storeId;
                $scope.params = $scope.params || {};
                $scope.zone_hash_edit = [];
                $scope.opening_hours = [];


                firebase.database().ref('/market_store/' + storeId).once('value').then(function(data) {
                    $scope.params = data.val();
                    $scope.params.sub_category = $scope.params.category;
                    // $scope.params.imagePath = $scope.cloud_url + data.logo;
                    // if ($scope.params.state_code) {
                    //     $scope.getMarketOffice($scope.params.state_code);
                    // }
                    // if ($scope.params.market_office) {
                    //     $scope.getMarketOfficeCity($scope.params.market_office);
                    // }

                    // $scope.getDeliveryZones($scope.params.market_office_city);

                    $scope.params.imagePath = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/' + $scope.params.logo;

                    if ($scope.params.zone) {
                        angular.forEach($scope.params.zone, function(key, value) {
                            $scope.zone_hash_edit.push(value);
                        });
                    }
                    $scope.params.zone_hash = $scope.zone_hash_edit;

                    // var response = data.val();
                    if ($scope.params.state_code) {
                        $scope.marketOfficeList($scope.params.state_code);
                    }

                    if ($scope.params.state_code && $scope.params.market_office) {
                        $scope.marketOfficeCityList($scope.params.state_code, $scope.params.market_office);
                    }

                    if ($scope.params.state_code && $scope.params.market_office_city) {
                        $scope.zoneList($scope.params.state_code, $scope.params.market_office_city);
                    }

                    
                    // console.log($scope.params);
                    if (!$scope.$$phase) $scope.$apply();
                });

                firebase.database().ref('/market_store_opening_hours/' + storeId).once('value').then(function(ophResponse) {
                    //$scope.params = ophResponse.val();
                    $scope.opening_hours = ophResponse.val();
                    if (!$scope.$$phase) $scope.$apply();
                });


            };

            $scope.saveMarketStore = function(params) {
                if (params) {
                    var storeId = $stateParams.id;
                    async.waterfall([
                            //@@@@@@@@@@@@ This callback is for updating logo to AWS and then to firebase
                            function(callback) {
                                if ($scope.params.logo !== undefined && $scope.params.logo !== '' && $scope.params.logo.indexOf("base64") !== -1) {
                                    MarketStoreService.save({
                                        'jsonrpc': '2.0',
                                        'method': 'upload',
                                        'params': $scope.params
                                    }, function(response) {
                                        if (response.error) {
                                            callback(response.error.message, null);
                                        } else {
                                            callback(null, response.result);
                                        }
                                    });
                                } else {
                                    callback(null, $scope.params.logo);
                                }
                            },
                            //@@@@@@@@@@@@ This callback is for updating store data to firebase
                            function(logo, callback) {
                                var zoneHash = {};
                                var storeCat = {};

                                // params.zone_hash.forEach(function(v, k) {
                                //     zoneHash[v] = true;
                                // });

                                params.sub_category.forEach(function(v, k) {
                                    storeCat[k] = v.text;
                                });

                                params.modified_at = Globalutc.now();

                                // params.zone = zoneHash;
                                params.category = storeCat;
                                //params.opening_hours = $scope.opening_hours;

                                delete params.sub_category;


                                if (params.contact_no) {
                                    $scope.params.contact_no = $scope.params.contact_no.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                                }

                                params.logo = logo;

                                var state_code = params.state_code.id;
                                delete params.state_code;
                                params.state_code = state_code;

                                var market_office_city = params.market_office_city;
                                delete params.market_office_city;
                                params.market_office_city = market_office_city;

                                var market_office = params.market_office;
                                delete params.market_office;
                                params.market_office = market_office;

                                params.zone_hash.forEach(function(v, k) {
                                    zoneHash[v] = true;
                                });
                                params.zone = zoneHash;
                                delete params.zone_hash;

                                var ref = firebase.database().ref('market_store');
                                ref.child(storeId).update(params, function(data) {
                                    callback(null, storeId);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },
                            //@@@@@@@@@@@@ This callback is for adding opening hours to firebase
                            function callback(storeId, callback) {
                                var ref = firebase.database().ref("market_store_opening_hours/" + storeId);
                                ref.set($scope.opening_hours).then(function(data) {
                                    callback(null, storeId);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },
                            //@@@@@@@@@@@@ This callback is for updating lat , lng to geocode
                            function callback(storeId, callback) {
                                //# adding lat,long to geoFire
                                if ($scope.place && $scope.place.lat !== undefined && $scope.place.lng !== undefined) {
                                    var geoFire = new GeoFire(firebase.database().ref("market_store_location"));
                                    geoFire.set(storeId, [$scope.place.lat, $scope.place.lng]).then(function() {
                                        callback(null, "Provided key has been added to GeoFire");
                                    }, function(error) {
                                        callback(error, null);
                                    });
                                } else {
                                    callback(null, '');
                                }
                            }
                        ],
                        function(error, result) {
                            if (error) {
                                $scope.toastrError('Can not updated the store due to some error with ===> ' + error, {});
                            } else {
                                $scope.toastrSuccess('You have successfully updated the store.', {});
                                $location.path('/ng/market-store/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                }
            };

            //# Delete market store
            $scope.deleteMarketStore = function(marketStoreId) {
                if ($window.confirm('Do you really want to delete this Store?')) {
                    if (marketStoreId) {
                        firebase.database().ref('market_store/' + marketStoreId).remove(function(error) {
                            if (error) {
                                $scope.toastrError(error, {});
                            } else {
                                $scope.toastrSuccess('Market store deleted successfully.', {});
                                $location.path('/ng/market-store/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                    } else {
                        $scope.toastrError("Oppes! invalid market Store", {});
                        $location.path('/ng/market-store/list');
                        if (!$scope.$$phase) $scope.$apply();
                    }
                }
            };









            //# market store contact listing here
            $scope.listOfMarketStoreContact = {};
            $scope.totalMarketStoreContact = 0;
            $scope.getMarketStoreContactInfo = function() {
                var marketStoreId = $stateParams.id;
                //console.log('deepak',marketStoreId); return false;
                if (marketStoreId) {
                    firebase.database().ref('market_store/' + marketStoreId).on("value", function(snapshot) {
                        var response = snapshot.val();
                        if (response) {
                            $scope.listOfMarketStoreContact = response.contact_info;
                            if ($scope.listOfMarketStoreContact) {
                                $scope.totalMarketStoreContact = Object.keys($scope.listOfMarketStoreContact).length;
                            } else {
                                $scope.totalMarketStoreContact = 0;
                            }
                            $scope.params = {
                                id: snapshot.key,
                                name: response.name
                            };
                        }
                        if (!$scope.$$phase) $scope.$apply();
                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                    });
                }
            };

            //# Open Add Market Store Contact Modal
            $scope.animationsEnabled = true;
            $scope.addNewContactPopup = function(size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'add_new_contact',
                    controller: 'MarketContactModalInstanceCtrl',
                    size: size,
                    resolve: {
                        marketStoreId: function() {
                            return $stateParams.id;
                        },
                        conInfoId: function() {
                            return null;
                        },
                        listOfMarketStoreContact: function() {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                }, function() {
                    $scope.getMarketStoreContactInfo();
                });
            };
            //# End

            //# Open Edit Market Store Contact Modal
            $scope.animationsEnabled = true;
            $scope.updateContactPopup = function(con_info_id, size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'update_contact',
                    controller: 'MarketContactModalInstanceCtrl',
                    size: size,
                    resolve: {
                        marketStoreId: function() {
                            return $stateParams.id;
                        },
                        conInfoId: function() {
                            return con_info_id;
                        },
                        listOfMarketStoreContact: function() {
                            return $scope.listOfMarketStoreContact[con_info_id];
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                }, function() {
                    $scope.getMarketStoreContactInfo();
                });
            };
            //# End

            //# Delete Market Store Contact details by id
            $scope.deleteMarketOfficeContact = function(marketStoreId, storeConId) {
                if ($window.confirm('Do you really want to delete this contact?')) {
                    firebase.database().ref('market_store/' + marketStoreId + '/contact_info/' + storeConId).remove(function(error) {
                        if (error) {
                            $scope.toastrError(error, {});
                        } else {
                            $scope.toastrSuccess("Contact deleted successfully.", {});
                            $scope.getMarketStoreContactInfo();
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    });
                }
            };



            //Reset form by button click
            $scope.reset = function() {
                $scope.params.name = '';
                $scope.params.email = '';
                $scope.params.contact_no = '';
                $scope.params.address = '';
                $scope.params.zipcode = '';
                $scope.params.fax_no = '';
                $scope.params.comment = '';
                $scope.params.percentage = '';
                $scope.params.logo = '';
                $scope.params.imagePath = '';
                angular.element('.fileinput-preview img').attr('src', '');
                $scope.params.active = 'true';
                $scope.params.state_code = '';
                $scope.params.market_office = '';
                $scope.params.market_office = '';
                $scope.params.market_office_city = '';
                $scope.params.zone_hash = [];
                $scope.params.sub_category = [];
                $scope.allFunctionsDeclaration();
                $scope.marketStoreForm.$setPristine();
                $scope.marketStoreForm.$setUntouched();
                // console.log($scope.params);

            };

            // get market office list
            $scope.listOfMarketOffice = {};
            $scope.marketOfficeList = function(stateCode) {
                restaurantResource.get({
                    method: 'market-office-list',
                    state: stateCode
                }, function(response) {
                    if (response.error) {
                        $scope.listOfMarketOffice = {};
                    } else {
                        $scope.listOfMarketOffice = response.result[0];
                    }
                });
            };

            // get market office city list
            $scope.listOfMarketOfficeCity = {};
            $scope.marketOfficeCityList = function(stateCode, marketOfficeId) {
                console.log(stateCode, marketOfficeId);
                restaurantResource.get({
                    method: 'market-office-city-list',
                    state: stateCode,
                    marketOfficeId: marketOfficeId
                }, function(response) {
                    if (response.error) {
                        $scope.listOfMarketOfficeCity = {};
                    } else {
                        $scope.listOfMarketOfficeCity = response.result[0];
                    }
                    if (!$scope.$$phase) $scope.$apply();
                });
            };

            // getzone list
            $scope.listOfZone = {};
            $scope.zoneList = function(stateCode, marketOfficeCityId) {
                restaurantResource.get({
                    method: 'zone-list',
                    state: stateCode,
                    marketOfficeCityId: marketOfficeCityId
                }, function(response) {
                    if (response.error) {
                        $scope.listOfZone = {};
                    } else {
                        $scope.listOfZone = response.result[0];
                    }
                });
            };

            $scope.init = function() {

                //calling list if list page is called
                var stateInit = {
                    'ng.market-store.list': function() {
                        $scope.marketStoreList();
                    },
                    'ng.market-store.edit': function() {
                        $scope.getMarketStoreInfo();
                        $scope.changedValue = function(stateCode) {
                            $scope.marketOfficeList(stateCode);
                        };

                        $scope.changedMktofficeValue = function(stateCode, marketOfficeId) {
                            $scope.marketOfficeCityList(stateCode, marketOfficeId);
                        };

                        $scope.changedMktofficeCityValue = function(stateCode, marketOfficeCityId) {
                            $scope.zoneList(stateCode, marketOfficeCityId);
                        };
                    },
                    'ng.market-store.add': function() {
                        $scope.allFunctionsDeclaration();

                        $scope.changedValue = function(stateCode) {
                            $scope.marketOfficeList(stateCode);
                        };

                        $scope.changedMktofficeValue = function(stateCode, marketOfficeId) {
                            $scope.marketOfficeCityList(stateCode, marketOfficeId);
                        };

                        $scope.changedMktofficeCityValue = function(stateCode, marketOfficeCityId) {
                            $scope.zoneList(stateCode, marketOfficeCityId);
                        };

                    },
                    'ng.market-store.view-contact-info': function() {
                        $scope.getMarketStoreContactInfo();
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


(function() {
    'use static';
    angular.module('FoodjetsApp').controller('MarketContactModalInstanceCtrl', ['$scope', '$modalInstance', 'marketStoreId', 'conInfoId', 'listOfMarketStoreContact',
        function($scope, $modalInstance, marketStoreId, conInfoId, listOfMarketStoreContact) {
            $scope.contact_info = {};

            //# Add Market Store Contact Details
            $scope.addMarketStoreContact = function($valid) {
                if ($valid) {
                    firebase.database().ref('market_store/' + marketStoreId + '/contact_info').push().set($scope.contact_info).then(function() {
                        $scope.toastrSuccess('Contact added successfully.', {});
                        $modalInstance.dismiss('cancel');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError(error, {});
                    });
                }
            };

            //# Edit Market Store Contact Details
            $scope.editMarketStoreContact = function($valid) {
                if ($valid) {
                    firebase.database().ref('market_store/' + marketStoreId + '/contact_info/' + conInfoId).update($scope.contact_edit_info).then(function() {
                        $scope.toastrSuccess('Contact updated the menu.', {});
                        $modalInstance.dismiss('cancel');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError(error, {});
                    });
                }
            };

            if (listOfMarketStoreContact) {
                $scope.contact_edit_info = {
                    title: listOfMarketStoreContact.title,
                    name: listOfMarketStoreContact.name,
                    email: listOfMarketStoreContact.email,
                    cellphone_no: listOfMarketStoreContact.cellphone_no
                };
            }

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})();
