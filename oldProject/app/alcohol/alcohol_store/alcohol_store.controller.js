(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('AlcoholStoreController', ['$rootScope',
        '$stateParams',
        '$state',
        '$modal',
        '$window',
        '$scope',
        '$http',
        '$timeout',
        '$location',
        'alcoholStoreService',
        'marketOffice',
        'marketOfficeCityService',
        'zoneService',
        'RTFoodJets',
        'Globalutc',
        'alcoholStoreSearchService',
        'restaurantResource',
        function(
            $rootScope, $stateParams, $state, $modal, $window, $scope, $http,
            $timeout, $location, alcoholStoreService, marketOffice,
            marketOfficeCityService, zoneService, RTFoodJets, Globalutc, alcoholStoreSearchService, restaurantResource) {

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
            $scope.info = $scope.infoDb = {};
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

            //# start time and end time value assign with current time
            var currentD = new Date().toString();
            $scope.start_time = $scope.end_time = moment(currentD).utc().format('YYYY-MM-DD HH:mm:ss');

            //# hour and minute steps declaration
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
                alcoholStoreService.get({ method: 'getAllDeliveryZones' }, function(response) {
                    if (response.result) {
                        $scope.info = response.result;
                        //console.log($scope.info);
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
                marketOfficeCityService.get({ 'method': 'all', 'state': $scope.selectedState, 'mofid': $scope.selectedOffice }, function(response) {
                    $scope.info = {};
                    if (response.result) {
                        $scope.marketOfficeCities = response.result;
                    }
                });
            };

            $scope.getDeliveryZones = function() {
                zoneService.get({ 'method': 'all', 'state': $scope.selectedState, 'mofid': $scope.selectedOffice }, function(response) {
                    $scope.info = {};
                    if (response.result) {
                        $scope.deliveryZones = response.result;
                    }
                });
            };

            $scope.placeChanged = function() {
                var places = this.getPlace();
                $scope.place = { 'lat': places.geometry.location.lat(), 'lng': places.geometry.location.lng() };
            };
            //# These function will call when go to alcohol store add page ends

            $scope.addAlcoholStore = function(params) {
                if (params) {
                    async.waterfall([
                            function(callback) {
                                firebase.database().ref("alcohol_store").orderByChild('email').equalTo($scope.params.email).once("value", function(snapshot) {
                                    if (snapshot.val()) {
                                        callback('Store already exist with this email address.', null);
                                    } else {
                                        callback();
                                    }
                                }, function(error) {
                                    callback(error.message, null);
                                });
                            },
                            //# This callback is for storing logo to AWS and then to firebase
                            function(callback) {
                                if ($scope.params.logo !== undefined && $scope.params.logo !== '') {
                                    alcoholStoreService.save({
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
                            //# This callback is for adding store data to firebase
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

                                delete params.opening_hours;
                                delete params.zone_hash;
                                delete params.sub_category;

                                if (params.contact_no) {
                                    $scope.params.contact_no = $scope.params.contact_no.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                                }

                                params.logo = logo;

                                var ref = firebase.database().ref("alcohol_store");
                                ref.push(params).then(function(data) {
                                    callback(null, data.key, $scope.opening_hours);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },

                            //# Adding opening_hours
                            function addOpeningHours(storeId, opening_hours, callback) {
                                firebase.database().ref('alcohol_store_opening_hours').child(storeId).update(opening_hours, function(data) {
                                    callback(null, storeId);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },

                            //# This callback is for adding lat , lng to geocode
                            function callback(storeId, callback) {
                                //# adding lat,long to geoFire
                                if ($scope.place) {
                                    var geoFire = new GeoFire(firebase.database().ref("alcohol_store_location"));
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
                                $scope.toastrError(error, {});
                            } else {
                                $scope.toastrSuccess('You have successfully added the store.', {});
                                $location.path('/ng/alcohol-store/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                }
            };

            $scope.alcoholStoreList = function() {
                $scope.loaderValue = true;
                var ref = firebase.database().ref("alcohol_store");
                ref.on('value', function(data) {
                    $scope.infoDb = $scope.info = data.val();
                    $scope.totalUsers = Object.keys($scope.info).length;
                    $scope.loaderValue = false;
                    if (!$scope.$$phase) $scope.$apply();
                });

            };

            $scope.alcoholGlobalSearch = function(){
              $scope.loaderValue = true;
              if ($scope.searchText !== '') {
                  var textToSearch = $scope.searchText;
                  alcoholStoreSearchService.get({ q: textToSearch, path: 'alcohol_store' }, function(data) {
                      if (data.result) {
                          $scope.info = data.result;
                          if ($scope.info) {
                              $scope.totalUsers = Object.keys($scope.info).length;
                          } else {
                              $scope.totalUsers = 0;
                          }
                      }
                      $scope.loaderValue = false;
                      if (!$scope.$$phase) $scope.$apply();

                  });
              }

            };

            $scope.searchAlcoholStoreList = function(){

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

            $scope.getAlcoholStoreInfo = function() {
                $scope.storeId = $stateParams.id;
                $scope.params = $scope.params || {};
                $scope.zone_hash_edit = [];
                $scope.opening_hours = [];

                firebase.database().ref('alcohol_store_opening_hours/' + $scope.storeId).once('value').then(function(ophResponse) {
                    $scope.opening_hours = ophResponse.val();
                    if (!$scope.$$phase) $scope.$apply();
                }).catch(function(error) {
                    console.log(error);
                    $scope.toastrError('Sorry!Some error occured!', {});
                });

                firebase.database().ref('/alcohol_store/' + $scope.storeId).once('value').then(function(data) {
                    /*
                    $scope.params = data.val();
                    $scope.params.sub_category = $scope.params.category;
                    $scope.params.imagePath = $scope.cloud_url + data.logo;
                    if ($scope.params.state_code) {
                        $scope.getMarketOffice($scope.params.state_code);
                    }
                    if ($scope.params.market_office) {
                        $scope.getMarketOfficeCity($scope.params.market_office);
                    }

                    $scope.getDeliveryZones($scope.params.market_office_city);

                    $scope.params.imagePath = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/' + $scope.params.logo;

                    if ($scope.params.zone) {
                        angular.forEach($scope.params.zone, function(key, value) {
                            $scope.zone_hash_edit.push(value);
                        });
                    }
                    $scope.params.zone_hash = $scope.zone_hash_edit;
                    //$scope.opening_hours = $scope.params.opening_hours;
                    */
                    $scope.params = data.val();
                    // console.log($scope.params);
                    $scope.params.sub_category = $scope.params.category;
                    

                    $scope.params.imagePath = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/' + $scope.params.logo;

                    if ($scope.params.zone) {
                        angular.forEach($scope.params.zone, function(key, value) {
                            $scope.zone_hash_edit.push(value);
                        });
                    }
                    $scope.params.zone_hash = $scope.zone_hash_edit;
                    
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
            };

            $scope.saveAlcoholStore = function(params) {
                if (params) {
                    var storeId = $stateParams.id;
                    async.waterfall([
                            //# This callback is for updating logo to AWS and then to firebase
                            function(callback) {
                                if ($scope.params.logo !== undefined && $scope.params.logo !== '' && $scope.params.logo.indexOf("base64") !== -1) {
                                    alcoholStoreService.save({
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
                            //# This callback is for updating store data to firebase
                            function(logo, callback) {
                                var zoneHash = {};
                                var storeCat = {};

                                params.zone_hash.forEach(function(v, k) {
                                    zoneHash[v] = true;
                                });

                                params.sub_category.forEach(function(v, k) {
                                    storeCat[k] = v.text;
                                });

                                params.created_at = Globalutc.now();
                                params.modified_at = Globalutc.now();

                                params.category = storeCat;
                                // params.zone = zoneHash;
                                delete params.opening_hours;
                                delete params.sub_category;

                                if (params.contact_no) {
                                    $scope.params.contact_no = $scope.params.contact_no.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                                }

                                params.logo = logo;

                                var state_code = params.state_code;
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
                                var ref = firebase.database().ref('alcohol_store');
                                ref.child(storeId).update(params, function(data) {
                                    callback(null, storeId, $scope.opening_hours);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },
                            //# Updating opening_hours
                            function updateOpeningHours(storeId, opening_hours, callback) {
                                firebase.database().ref('alcohol_store_opening_hours').child(storeId).update(opening_hours, function(data) {
                                    callback(null, storeId);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },
                            //# This callback is for updating lat , lng to geocode
                            function callback(storeId, callback) {
                                //# adding lat,long to geoFire
                                if ($scope.place && $scope.place.lat !== undefined && $scope.place.lng !== undefined) {
                                    var geoFire = new GeoFire(firebase.database().ref("alcohol_store_location"));
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
                                console.log(error);
                                $scope.toastrError('Can not updated the store due to some error with ===> ' + error, {});
                            } else {
                                $scope.toastrSuccess('You have successfully updated the store.', {});
                                $location.path('/ng/alcohol-store/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                }
            };

            //# Delete alcohol store
            $scope.deleteAlcoholStore = function(alcoholStoreId) {
                if ($window.confirm('Do you really want to delete this Store?')) {
                    $scope.checkRequest = function(callback) {
                        if (!alcoholStoreId || alcoholStoreId === null) {
                            cb('Not a valid store id.', null);
                        } else {
                            callback();
                        }
                    };

                    $scope.deleteItems = function(callback) {
                        firebase.database().ref('alcohol_store_catalog/' + alcoholStoreId).orderByChild('catalog_name').on('value', function(snapshot) {
                            if (snapshot.val()) {
                                angular.forEach(snapshot.val(), function(value, key) {
                                    if (key) {
                                        firebase.database().ref('alcohol_item/' + key).remove(function(error) {
                                            if (error) {
                                                callback(error, null);
                                            } else {
                                                callback(null);
                                            }
                                        });
                                    }
                                });
                            } else {
                                callback(null);
                            }
                        }, function(error) {
                            callback(error, null);
                        });
                    };

                    $scope.deleteStoreCat = function(callback) {
                        firebase.database().ref('alcohol_store_catalog/' + alcoholStoreId).remove(function(error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null);
                            }
                        });
                    };

                    $scope.deleteStoreOpeningHours = function(callback) {
                        firebase.database().ref('alcohol_store_opening_hours/' + alcoholStoreId).remove(function(error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null);
                            }
                        });
                    };

                    $scope.deleteStoreLocation = function(callback) {
                        firebase.database().ref('alcohol_store_location/' + alcoholStoreId).remove(function(error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null);
                            }
                        });
                    };

                    $scope.deleteStore = function(callback) {
                        firebase.database().ref('alcohol_store/' + alcoholStoreId).remove(function(error) {
                            if (error) {
                                callback(error, null);
                            } else {
                                callback(null);
                            }
                        });
                    };

                    async.waterfall([$scope.checkRequest, $scope.deleteItems, $scope.deleteStoreCat, $scope.deleteStoreOpeningHours, $scope.deleteStoreLocation, $scope.deleteStore], function(err, result) {
                        if (err !== null) {
                            $scope.toastrError(err, {});
                            $location.path('/ng/alcohol-store/list');
                            if (!$scope.$$phase) $scope.$apply();
                        } else {
                            $scope.toastrSuccess('Store deleted successfully.', {});
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    });
                }
            };

            //# market store contact listing here
            $scope.listOfAlcoholStoreContact = {};
            $scope.totalAlcoholStoreContact = 0;
            $scope.getAlcoholStoreContactInfo = function() {
                var alcoholStoreId = $stateParams.id;
                if (alcoholStoreId) {
                    firebase.database().ref('alcohol_store/' + alcoholStoreId).on("value", function(snapshot) {
                        var response = snapshot.val();
                        if (response) {
                            $scope.listOfAlcoholStoreContact = response.contact_info;
                            if ($scope.listOfAlcoholStoreContact) {
                                $scope.totalAlcoholStoreContact = Object.keys($scope.listOfAlcoholStoreContact).length;
                            } else {
                                $scope.totalAlcoholStoreContact = 0;
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
                    controller: 'AlcoholContactModalInstanceCtrl',
                    size: size,
                    resolve: {
                        alcoholStoreId: function() {
                            return $stateParams.id;
                        },
                        conInfoId: function() {
                            return null;
                        },
                        listOfAlcoholStoreContact: function() {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                }, function() {
                    $scope.getAlcoholStoreContactInfo();
                });
            };
            //# End

            //# Open Edit Market Store Contact Modal
            $scope.animationsEnabled = true;
            $scope.updateContactPopup = function(con_info_id, size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'update_contact',
                    controller: 'AlcoholContactModalInstanceCtrl',
                    size: size,
                    resolve: {
                        alcoholStoreId: function() {
                            return $stateParams.id;
                        },
                        conInfoId: function() {
                            return con_info_id;
                        },
                        listOfAlcoholStoreContact: function() {
                            return $scope.listOfAlcoholStoreContact[con_info_id];
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                }, function() {
                    $scope.getAlcoholStoreContactInfo();
                });
            };
            //# End

            //# Delete Alcohol Store Contact details by id
            $scope.deleteStoreContact = function(alcoholStoreId, storeConId) {
                if ($window.confirm('Do you really want to delete this contact?')) {
                    firebase.database().ref('alcohol_store/' + alcoholStoreId + '/contact_info/' + storeConId).remove(function(error) {
                        if (error) {
                            $scope.toastrError(error, {});
                        } else {
                            $scope.toastrSuccess("Contact deleted successfully.", {});
                            $scope.getAlcoholStoreContactInfo();
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
                $scope.alcoholStoreForm.$setPristine();
                $scope.alcoholStoreForm.$setUntouched();
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
                    'ng.alcohol-store.list': function() {
                        $scope.alcoholStoreList();
                    },
                    'ng.alcohol-store.edit': function() {
                        $scope.getAlcoholStoreInfo();
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
                    'ng.alcohol-store.add': function() {
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
                    'ng.alcohol-store.view-contact-info': function() {
                        $scope.getAlcoholStoreContactInfo();
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
    angular.module('FoodjetsApp').controller('AlcoholContactModalInstanceCtrl', ['$scope', '$modalInstance', 'alcoholStoreId', 'conInfoId', 'listOfAlcoholStoreContact',
        function($scope, $modalInstance, alcoholStoreId, conInfoId, listOfAlcoholStoreContact) {
            $scope.contact_info = {};

            //# Add Alcohol Store Contact Details
            $scope.addAlcoholStoreContact = function($valid) {
                if ($valid) {
                    firebase.database().ref('alcohol_store/' + alcoholStoreId + '/contact_info').push().set($scope.contact_info).then(function() {
                        $scope.toastrSuccess('Contact has been successfully added.', {});
                        $modalInstance.dismiss('cancel');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError(error, {});
                    });
                }
            };

            //# Edit Alcohol Store Contact Details
            $scope.editAlcoholStoreContact = function($valid) {
                if ($valid) {
                    firebase.database().ref('alcohol_store/' + alcoholStoreId + '/contact_info/' + conInfoId).update($scope.contact_edit_info).then(function() {
                        $scope.toastrSuccess('Contact has been successfully updated.', {});
                        $modalInstance.dismiss('cancel');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError(error, {});
                    });
                }
            };

            if (listOfAlcoholStoreContact) {
                $scope.contact_edit_info = {
                    title: listOfAlcoholStoreContact.title,
                    name: listOfAlcoholStoreContact.name,
                    email: listOfAlcoholStoreContact.email,
                    cellphone_no: listOfAlcoholStoreContact.cellphone_no
                };
            }

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})();
