(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('RestaurantController', [
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        'restaurantResource',
        'restaurantSearchService',
        'marketOffice',
        '$window',
        '$compile',
        '$state',
        '$modal',
        'FIREBASE_TOKEN',
        'RTFoodJets',
        'math',
        'Globalutc',
        function($rootScope, $scope, $http, $stateParams, $location, $timeout, restaurantResource, restaurantSearchService, marketOffice, $window, $compile, $state, $modal, FIREBASE_TOKEN, RTFoodJets, math, Globalutc) {

            // aws info
            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';
            $scope.noImagePath = 'http://www.placehold.it/200x150/EFEFEF/AAAAAA&amp;text=no+image';

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.place = [];

            // get sate list
            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];

            //state selected - from url
            $scope.selectedState = $stateParams.state || 'CA';
            $scope.selectedCity = 0;

            //change the current state selected
            $scope.changeState = function(state) {
                $scope.selectedState = state;
                // $scope.restaurantList();
            };

            //change the current city selected
            $scope.changeCity = function(city) {
                // console.log($scope.selectedCity);
                $scope.selectedCity = city;
                // if (angular.isDefined(city) && city !== '') {
                //     $scope.selectedCity = city;
                //     $scope.restaurantListByCity();
                // }
                // else {
                //     $scope.restaurantList();
                // }
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

            // get restaurant user list
            $scope.listOfRestaurantUser = {};
            $scope.restaurantUserList = function() {
                firebase.database().ref('business_user').on("value", function(snapshot) {
                    var resusr = [];
                    angular.forEach(snapshot.val(), function(value, key) {
                        if (value.active === true) {
                            resusr.push({
                                id: key,
                                name: value.first_name + ' ' + value.last_name
                            });
                        }
                    });
                    $scope.listOfRestaurantUser = resusr;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(errorObject) {
                    $scope.toastrError(errorObject.message, {});
                });
            };

            $scope.listOfRestaurant = $scope.restaurantLocalDb = {};
            $scope.totalRestaurant = 0;
            // restaurant listing here
            $scope.restaurantList = function() {
                $scope.loaderValue = true;
                firebase.database().ref("restaurant").orderByChild('state_code').equalTo($scope.selectedState).on("value", function(snapshot) {
                    //firebase.database().ref("restaurant").orderByChild('zone/CA2').equalTo(true).on("value", function(snapshot) {
                    //console.log(snapshot);

                    $scope.restaurantLocalDb = $scope.listOfRestaurant = snapshot.val();
                    if ($scope.listOfRestaurant) {
                        $scope.totalRestaurant = Object.keys(snapshot.val()).length;
                    } else {
                        $scope.totalRestaurant = 0;
                    }
                    $scope.loaderValue = false;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(errorObject) {
                    console.log(errorObject);
                    $scope.toastrError(errorObject.message, {});
                });
            };
            // restaurant listing by city
            $scope.restaurantListByCity = function() {
                // console.log($scope.selectedState+$scope.selectedCity);//CA20
                $scope.loaderValue = true;
                firebase.database().ref("restaurant").orderByChild('market_office_city_code').equalTo($scope.selectedState + $scope.selectedCity).on("value", function(snapshot) {

                    // console.log(snapshot.val());

                    $scope.restaurantLocalDb = $scope.listOfRestaurant = snapshot.val();
                    if ($scope.listOfRestaurant) {
                        $scope.totalRestaurant = Object.keys(snapshot.val()).length;
                    } else {
                        $scope.totalRestaurant = 0;
                    }
                    $scope.loaderValue = false;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(errorObject) {
                    console.log(errorObject);
                    $scope.toastrError(errorObject.message, {});
                });
            };

            // Search restaurant Global
            $scope.searchGlobalRestaurant = function() {
                var textToSearch = $scope.searchText;
                if (textToSearch && textToSearch !== undefined) {
                    $scope.loaderValue = true;
                    restaurantSearchService.get({
                        q: textToSearch,
                        path: 'restaurant'
                    }, function(response) {
                        $scope.loaderValue = false;
                        if (response.result) {
                            $scope.listOfRestaurant = response.result;
                            if ($scope.listOfRestaurant) {
                                $scope.totalRestaurant = Object.keys(response.result).length;
                            } else {
                                $scope.totalRestaurant = 0;
                            }
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    });
                } else {
                    $scope.restaurantList();
                }
            };

            // Search Restaurant
            $scope.searchRestaurant = function() {

                // var textToSearch = $scope.searchText;
                // if (textToSearch && textToSearch !== undefined) {
                //     $scope.loaderValue = true;
                //     restaurantSearchService.get({
                //         q: textToSearch,
                //         state: $scope.params.market_office_state_code,
                //         city: $scope.params.market_office_id,
                //         path: 'restaurant'
                //     }, function(response) {
                //         $scope.loaderValue = false;
                //         if (response.result) {
                //             $scope.listOfRestaurant = response.result;
                //             if ($scope.listOfRestaurant) {
                //                 $scope.totalRestaurant = Object.keys(response.result).length;
                //             } else {
                //                 $scope.totalRestaurant = 0;
                //             }
                //             if (!$scope.$$phase) $scope.$apply();
                //         }
                //     });
                // } else {
                //     $scope.restaurantList();
                // }

                // console.log('data',$scope.searchText);

                var searchByStateAndCity = function(callback) {
                    // console.log($scope.selectedState,$scope.selectedCity);
                    //If state is selected and city is blank
                    if (angular.isDefined($scope.selectedState) && $scope.selectedState !== '' && (!angular.isDefined($scope.selectedCity) || $scope.selectedCity === 0)) {
                        $scope.restaurantList();
                    } else {
                        $scope.restaurantListByCity();
                    }
                    callback();
                }

                var searchByQueryString = function(callback) {
                    if (angular.isDefined($scope.searchText) && $scope.searchText !== '') {
                        if (/\S+/.test($scope.searchText)) {
                            $scope.listOfRestaurant = _.reduce($scope.restaurantLocalDb, function(o, k, i) {
                                var cuisine_tag = (k.cuisine_tag !== undefined && typeof k.cuisine_tag == 'object' ? k.cuisine_tag.join() : '');
                                if (k.name.toLowerCase().includes($scope.searchText.toLowerCase()) || cuisine_tag.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                                    k.contact_no.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                                    k.email.toLowerCase().includes($scope.searchText.toLowerCase())) {
                                    o[i] = k;
                                }
                                return o;
                            }, {});

                            // console.log($scope.listOfRestaurant);

                            if (!$scope.$$phase) $scope.$apply();

                        } else {
                            $scope.listOfRestaurant = $scope.restaurantLocalDb;
                        }
                        $scope.totalRestaurant = Object.keys($scope.listOfRestaurant).length;
                    }
                    // else {
                    // console.log(3);
                    // $scope.restaurantList();
                    // }
                    callback();
                }
                async.waterfall([searchByStateAndCity, searchByQueryString], function(err, result) {
                    if (err) {
                        console.log(err);
                        $scope.toastrError(err, {});
                    } else {
                        console.log('Restaurant search has been performed!');
                    }
                });

            };


            //# Add Restaurant
            $scope.addRestaurant = function($valid) {
                if ($valid) {
                    var isExist = function(callback) {
                        firebase.database().ref("restaurant").orderByChild('email').equalTo($scope.params.email).once("value", function(snapshot) {
                            if (snapshot.val()) {
                                callback('Restaurant already exist with this email address.', null);
                            } else {
                                callback();
                            }
                        }, function(errorObject) {
                            callback(errorObject.message, null);
                        });
                    };

                    var uploadFeaturedIcon = function(callback) {
                        if ($scope.params.banner || $scope.params.image) {

                            // restaurantResource.save({
                            //         'jsonrpc': '2.0',
                            //         'method': 'upload',
                            //         'params': {
                            //             name: $scope.params.name,
                            //             banner: $scope.params.banner,
                            //             image: $scope.params.image
                            //         }
                            //     }, function(response) {
                            //         if (response.error) {
                            //             callback(response.error.message, null);
                            //         } else {
                            //             callback(null, response.result);
                            //         }
                            //     });


                            var params = {
                                name: $scope.params.name
                            };
                            //if image needs to be uploaded
                            if ($scope.params.image) {
                                params.image = $scope.params.image;
                            }
                            //if banner needs to be uploaded
                            if ($scope.params.banner) {
                                params.banner = $scope.params.banner;
                            }

                            var saveData = function(params) {
                                // callback('testing', null);
                                restaurantResource.save({
                                    'jsonrpc': '2.0',
                                    'method': 'upload',
                                    'params': params
                                }, function(response) {
                                    if (response.error) {
                                        callback(response.error.message, null);
                                    } else {
                                        callback(null, response.result);
                                    }
                                });

                            };

                            var errorMessage = '';
                            var fileInput1 = angular.element("input[name=image]")[0],
                                file1 = fileInput1.files && fileInput1.files[0],
                                fileInput2 = angular.element("input[name=banner]")[0],
                                file2 = fileInput2.files && fileInput2.files[0],
                                img = new Image();
                            window.URL = window.URL || window.webkitURL;
                            //both image and banner exists
                            if (file1 && file2) {
                                img.src = window.URL.createObjectURL(file1);
                                img.onload = function() {
                                    var width = img.naturalWidth,
                                        height = img.naturalHeight;
                                    // console.log(width, height);
                                    window.URL.revokeObjectURL(img.src);
                                    if (width !== 1040 && height !== 486) {
                                        errorMessage = '1040X486 images are allowed only as restaurant-image.';
                                    }
                                    //if rest image is valid
                                    if (errorMessage === '') {
                                        img.src = window.URL.createObjectURL(file2);
                                        img.onload = function() {
                                            width = img.naturalWidth,
                                                height = img.naturalHeight;
                                            // console.log(width, height);
                                            window.URL.revokeObjectURL(img.src);
                                            if (width !== 751 && height !== 149) {
                                                errorMessage = '751X149 images are allowed only as restaurant-banner.';
                                                $scope.toastrError(errorMessage, {});
                                            } else {
                                                console.log('Both are valid images');
                                                saveData(params);
                                            }
                                        };
                                    } else {
                                        $scope.toastrError(errorMessage, {});
                                    }
                                };

                            }
                            //only image exists
                            if (file1 && !file2) {

                                img.src = window.URL.createObjectURL(file1);
                                img.onload = function() {
                                    var width = img.naturalWidth,
                                        height = img.naturalHeight;
                                    // console.log(width, height);
                                    window.URL.revokeObjectURL(img.src);
                                    if (width !== 1040 && height !== 486) {
                                        errorMessage = '1040X486 images are allowed only as restaurant-image.';
                                        $scope.toastrError(errorMessage, {});
                                    } else {
                                        console.log('restaurant image is valid');
                                        saveData(params);
                                    }
                                };

                            }
                            //only banner exists
                            if (!file1 && file2) {

                                img.src = window.URL.createObjectURL(file2);
                                img.onload = function() {
                                    var width = img.naturalWidth,
                                        height = img.naturalHeight;
                                    // console.log(width, height);
                                    window.URL.revokeObjectURL(img.src);
                                    if (width !== 751 && height !== 149) {
                                        errorMessage = '751X149 images are allowed only as restaurant-banner.';
                                        $scope.toastrError(errorMessage, {});
                                    } else {
                                        console.log('restaurant banner is valid');
                                        saveData(params);
                                    }
                                };

                            }





                        } else {
                            callback(null, '');
                        }
                    };

                    var addRestaurant = function(files, callback) {
                        $scope.zonedata = {};
                        // Check cuisine types
                        if (typeof $scope.params.cuisine_tag === 'object' && $scope.params.cuisine_tag.length > 0) {
                            var cuisine_tag = $scope.params.cuisine_tag.map(function(obj) {
                                return obj.text;
                            });
                            $scope.params.cuisine_tag = cuisine_tag;
                        }

                        // zone array
                        if ($scope.params.zone) {
                            angular.forEach($scope.params.zone, function(value, key) {
                                $scope.zonedata[value] = true;
                            });
                        }

                        // Filltering special character
                        if ($scope.params.contact_no) {
                            $scope.params.contact_no = $scope.params.contact_no.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                        }

                        // Adding data to firebase satart
                        var post_data = {
                            name: $scope.params.name,
                            email: $scope.params.email,
                            contact_no: $scope.params.contact_no,
                            zip: $scope.params.zip,
                            address: $scope.params.address,
                            rest_avg_prep_time: $scope.params.rest_avg_prep_time,
                            snd_drvr_erly_mins: $scope.params.snd_drvr_erly_mins,
                            rstrnt_stmnt_fee: ($scope.params.rstrnt_stmnt_fee === undefined || $scope.params.rstrnt_stmnt_fee === '' || $scope.params.rstrnt_stmnt_fee === null || $scope.params.rstrnt_stmnt_fee == 0) ? 0 : math.round($scope.params.rstrnt_stmnt_fee),
                            rstrnt_pay_tax: $scope.params.rstrnt_pay_tax,
                            fdjts_trgt_pct: ($scope.params.fdjts_trgt_pct) ? $scope.params.fdjts_trgt_pct : 0,
                            fdjts_disc_pct: ($scope.params.fdjts_disc_pct) ? $scope.params.fdjts_disc_pct : 0,
                            rstrn_srv_fee_pct: ($scope.params.rstrn_srv_fee_pct) ? $scope.params.rstrn_srv_fee_pct : 0,
                            feat_rstrnt: false,
                            feat_rstrnt_exp: '',
                            // feat_rstrnt: $scope.params.feat_rstrnt,
                            // feat_rstrnt_exp: ($scope.params.feat_rstrnt!=undefined && $scope.params.feat_rstrnt===true) ? Globalutc.now() : null,
                            fax_no: ($scope.params.fax) ? $scope.params.fax : '',
                            state_code: $scope.params.state_code,
                            cuisine_tag: $scope.params.cuisine_tag,
                            market_office_code: $scope.params.state_code + $scope.params.market_office_id,
                            market_office_city_code: $scope.params.state_code + $scope.params.market_office_city_id,
                            zone: $scope.zonedata,
                            business_user_id: $scope.params.business_user_id,
                            current_menu_id: '',
                            banner: files['banner'] || '',
                            image: files['image'] || '',
                            featured_note: ($scope.params.featured_note) ? $scope.params.featured_note : '',
                            comment: ($scope.params.comment) ? $scope.params.comment : '',
                            foodjets_percentage: 0,
                            contact_info: [],
                            order_amount: {
                                min: math.round($scope.params.order_amount.min),
                                max: math.round($scope.params.order_amount.max)
                            },
                            active: $scope.params.active,
                            created_at: Globalutc.now(),
                            modified_at: Globalutc.now()
                        };
                        if ($scope.place) {
                            post_data.location = { lat: $scope.place.lat, lng: $scope.place.lng };
                        }
                        firebase.database().ref('restaurant').push(post_data).then(function(data) {
                            callback(null, post_data.business_user_id, data.key);
                        }).catch(function(error) {
                            callback(error, null);
                        });
                    };

                    var updateBusinessUserAndgeoFire = function(businessUserId, restaurantId, callback) {
                        if (restaurantId) {
                            var business_user_data = {};
                            business_user_data[restaurantId] = true;
                            firebase.database().ref('business_user/' + businessUserId + '/restaurant').update(business_user_data, function(error) {
                                if (error) {
                                    console.log(error);
                                    callback(error, null);
                                } else {
                                    callback(null, 'Business user has been updated!');
                                }
                            });
                        } else {
                            callback(null, 'success');
                        }
                    };

                    async.waterfall([isExist, uploadFeaturedIcon, addRestaurant, updateBusinessUserAndgeoFire], function(err, result) {
                        if (err !== null) {
                            $scope.toastrError(err, {});
                        } else {
                            $scope.toastrSuccess('Restaurant added successfully.', {});
                            $location.path('/ng/restaurant/list');
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    });
                }
            };

            //# get restaurant details by id
            $scope.getRestaurantInfo = function() {
                var restaurantId = $stateParams.id;
                $scope.zone = [];
                if (restaurantId) {
                    firebase.database().ref("restaurant").orderByKey().equalTo(restaurantId).once("child_added", function(snapshot, prevChildKey) {
                        var response = snapshot.val();
                        // console.log(response.market_office_code+'/'+response.market_office_city_code);
                        response.market_office_id = parseInt(response.market_office_code.replace(response.state_code, ''));
                        response.market_office_city_id = parseInt(response.market_office_city_code.replace(response.state_code, ''));
                        if (response.state_code) {
                            $scope.marketOfficeList(response.state_code);
                        }

                        if (response.state_code && response.market_office_id) {
                            $scope.marketOfficeCityList(response.state_code, response.market_office_id);
                        }

                        if (response.state_code && response.market_office_city_id) {
                            $scope.zoneList(response.state_code, response.market_office_city_id);
                        }

                        if (response.zone) {
                            angular.forEach(response.zone, function(key, value) {
                                $scope.zone.push(value);
                            });
                        }

                        $scope.params = {
                            id: restaurantId,
                            name: response.name,
                            email: response.email,
                            contact_no: response.contact_no,
                            address: response.address,
                            rstrnt_stmnt_fee: (response.rstrnt_stmnt_fee === undefined || response.rstrnt_stmnt_fee === '' || response.rstrnt_stmnt_fee === null || response.rstrnt_stmnt_fee == 0) ? 0 : math.round(response.rstrnt_stmnt_fee),
                            rstrnt_pay_tax: (response.rstrnt_pay_tax) ? response.rstrnt_pay_tax : false,
                            // feat_rstrnt: (response.feat_rstrnt) ? response.feat_rstrnt : false,
                            fdjts_trgt_pct: ($scope.params.fdjts_trgt_pct) ? $scope.params.fdjts_trgt_pct : '',
                            fdjts_disc_pct: ($scope.params.fdjts_disc_pct) ? $scope.params.fdjts_disc_pct : '',
                            rstrn_srv_fee_pct: ($scope.params.rstrn_srv_fee_pct) ? $scope.params.rstrn_srv_fee_pct : '',
                            zip: response.zip,
                            fax: response.fax_no,
                            state_code: response.state_code,
                            banner: response.banner,
                            image: response.image,
                            bannerPath: $scope.cloud_url + response.banner,
                            imagePath: $scope.cloud_url + response.image,
                            market_office_id: response.market_office_id,
                            market_office_city_id: response.market_office_city_id,
                            zone: $scope.zone,
                            bns_usr_id: response.business_user_id,
                            business_user_id: response.business_user_id,
                            current_menu_id: "",
                            cuisine_tag: response.cuisine_tag,
                            order_amount: {
                                min: math.round(response.order_amount.min).toFixed(2),
                                max: math.round(response.order_amount.max).toFixed(2)
                            },
                            featured_note: response.featured_note,
                            comment: response.comment
                        };
                        if (response.rest_avg_prep_time && response.rest_avg_prep_time !== undefined) {
                            $scope.params.rest_avg_prep_time = response.rest_avg_prep_time;
                        }
                        if (response.snd_drvr_erly_mins && response.snd_drvr_erly_mins !== undefined) {
                            $scope.params.snd_drvr_erly_mins = response.snd_drvr_erly_mins;
                        }
                        if (angular.isDefined(response.active)) {
                            $scope.params.active = response.active;
                        }
                        if (!$scope.$$phase) $scope.$apply();
                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                        $location.path('/ng/restaurant/list');
                        if (!$scope.$$phase) $scope.$apply();
                    });
                } else {
                    $scope.toastrError("Oppes! invalid restaurant", {});
                    $location.path('/ng/restaurant/list');
                    if (!$scope.$$phase) $scope.$apply();
                }
            };

            //# Update Restaurant
            $scope.updateRestaurant = function($valid) {
                if ($valid) {
                    var isExist = function(callback) {
                        firebase.database().ref("restaurant").orderByChild('email').equalTo($scope.params.email).once("child_added", function(snapshot) {
                            if ($stateParams.id !== snapshot.key) {
                                callback('Restaurant already exist with this email address.', null);
                            } else {
                                callback();
                            }
                        }, function(errorObject) {
                            callback(errorObject.message, null);
                        });
                    };

                    var uploadFeaturedIcon = function(callback) {
                        if ($scope.params.banner !== undefined && $scope.params.banner !== '') {
                            $scope.params.banner = $scope.params.banner;
                        }

                        if ((!!$scope.params.banner && $scope.params.banner.indexOf("base64") !== -1) ||
                            (!!$scope.params.image && $scope.params.image.indexOf("base64") !== -1)) {

                            var params = {
                                name: $scope.params.name
                            };
                            //if image needs to be uploaded
                            if ($scope.params.image.indexOf("base64") !== -1) {
                                params.image = $scope.params.image;
                            }
                            //if banner needs to be uploaded
                            if ($scope.params.banner.indexOf("base64") !== -1) {
                                params.banner = $scope.params.banner;
                            }

                            var saveData = function(params) {
                                // callback('testing', null);
                                restaurantResource.save({
                                    'jsonrpc': '2.0',
                                    'method': 'upload',
                                    'params': params
                                }, function(response) {
                                    if (response.error) {
                                        callback(response.error.message, null);
                                    } else {
                                        callback(null, response.result);
                                    }
                                });

                            };

                            var errorMessage = '';
                            var fileInput1 = angular.element("input[name=image]")[0],
                                file1 = fileInput1.files && fileInput1.files[0],
                                fileInput2 = angular.element("input[name=banner]")[0],
                                file2 = fileInput2.files && fileInput2.files[0],
                                img = new Image();
                            window.URL = window.URL || window.webkitURL;
                            //both image and banner exists
                            if ($scope.params.image.indexOf("base64") !== -1 && $scope.params.banner.indexOf("base64") !== -1) {
                                img.src = window.URL.createObjectURL(file1);
                                img.onload = function() {
                                    var width = img.naturalWidth,
                                        height = img.naturalHeight;
                                    // console.log(width, height);
                                    window.URL.revokeObjectURL(img.src);
                                    if (width !== 1040 && height !== 486) {
                                        errorMessage = '1040X486 images are allowed only as restaurant-image.';
                                    }
                                    //if rest image is valid
                                    if (errorMessage === '') {
                                        img.src = window.URL.createObjectURL(file2);
                                        img.onload = function() {
                                            width = img.naturalWidth,
                                                height = img.naturalHeight;
                                            // console.log(width, height);
                                            window.URL.revokeObjectURL(img.src);
                                            if (width !== 751 && height !== 149) {
                                                errorMessage = '751X149 images are allowed only as restaurant-banner.';
                                                $scope.toastrError(errorMessage, {});
                                            } else {
                                                console.log('Both are valid images');
                                                saveData(params);
                                            }
                                        };
                                    } else {
                                        $scope.toastrError(errorMessage, {});
                                    }
                                };

                            }
                            //only image exists
                            if ($scope.params.image.indexOf("base64") !== -1 && $scope.params.banner.indexOf("base64") === -1) {

                                img.src = window.URL.createObjectURL(file1);
                                img.onload = function() {
                                    var width = img.naturalWidth,
                                        height = img.naturalHeight;
                                    // console.log(width, height);
                                    window.URL.revokeObjectURL(img.src);
                                    if (width !== 1040 && height !== 486) {
                                        errorMessage = '1040X486 images are allowed only as restaurant-image.';
                                        $scope.toastrError(errorMessage, {});
                                    } else {
                                        console.log('restaurant image is valid');
                                        saveData(params);
                                    }
                                };

                            }
                            //only banner exists
                            if ($scope.params.image.indexOf("base64") === -1 && $scope.params.banner.indexOf("base64") !== -1) {

                                img.src = window.URL.createObjectURL(file2);
                                img.onload = function() {
                                    var width = img.naturalWidth,
                                        height = img.naturalHeight;
                                    // console.log(width, height);
                                    window.URL.revokeObjectURL(img.src);
                                    if (width !== 751 && height !== 149) {
                                        errorMessage = '751X149 images are allowed only as restaurant-banner.';
                                        $scope.toastrError(errorMessage, {});
                                    } else {
                                        console.log('restaurant banner is valid');
                                        saveData(params);
                                    }
                                };

                            }

                        } else {
                            // console.log('No image needs to be changed');
                            callback(null, [true, $scope.params.banner, $scope.params.image]);
                        }
                    };

                    var updateRestaurant = function(files, callback) {
                        var restaurantId = $stateParams.id;
                        $scope.zonedata = {};
                        // Check cuisine types
                        if (typeof $scope.params.cuisine_tag === 'object' && $scope.params.cuisine_tag.length > 0) {
                            var cuisine_tag = $scope.params.cuisine_tag.map(function(obj) {
                                return obj.text;
                            });
                            $scope.params.cuisine_tag = cuisine_tag;
                        }

                        // zone array
                        if ($scope.params.zone) {
                            angular.forEach($scope.params.zone, function(value, key) {
                                $scope.zonedata[value] = true;
                            });
                        }

                        if ($scope.params.contact_no) {
                            $scope.params.contact_no = $scope.params.contact_no.replace(/[`~!@#$%^&*()_|+\-=?;:'", .<>\{\}\[\]\\\/]/gi, '');
                        }

                        // Updating data to firebase satart
                        var post_data = {
                            name: $scope.params.name,
                            email: $scope.params.email,
                            contact_no: $scope.params.contact_no,
                            zip: $scope.params.zip,
                            address: $scope.params.address,
                            rstrnt_stmnt_fee: ($scope.params.rstrnt_stmnt_fee === undefined || $scope.params.rstrnt_stmnt_fee === '' || $scope.params.rstrnt_stmnt_fee === null || $scope.params.rstrnt_stmnt_fee == 0) ? 0 : math.round($scope.params.rstrnt_stmnt_fee),
                            rstrnt_pay_tax: $scope.params.rstrnt_pay_tax,
                            fdjts_trgt_pct: ($scope.params.fdjts_trgt_pct && $scope.params.fdjts_trgt_pct !== '') ? $scope.params.fdjts_trgt_pct : 0,
                            fdjts_disc_pct: ($scope.params.fdjts_disc_pct && $scope.params.fdjts_disc_pct !== '') ? $scope.params.fdjts_disc_pct : 0,
                            rstrn_srv_fee_pct: ($scope.params.rstrn_srv_fee_pct && $scope.params.rstrn_srv_fee_pct !== '') ? $scope.params.rstrn_srv_fee_pct : 0,
                            feat_rstrnt: false,
                            feat_rstrnt_exp: '',
                            // feat_rstrnt: $scope.params.feat_rstrnt,
                            // feat_rstrnt_exp: ($scope.params.feat_rstrnt!=undefined && $scope.params.feat_rstrnt===true) ? Globalutc.now() : '',
                            fax_no: $scope.params.fax,
                            state_code: $scope.params.state_code,
                            cuisine_tag: $scope.params.cuisine_tag,
                            market_office_code: $scope.params.state_code + $scope.params.market_office_id,
                            market_office_city_code: $scope.params.state_code + $scope.params.market_office_city_id,
                            zone: $scope.zonedata,
                            business_user_id: $scope.params.business_user_id,
                            banner: files['banner'] || $scope.params.banner,
                            image: files['image'] || $scope.params.image,
                            featured_note: ($scope.params.featured_note) ? $scope.params.featured_note : '',
                            comment: ($scope.params.comment) ? $scope.params.comment : '',
                            foodjets_percentage: 0,
                            order_amount: {
                                min: math.round($scope.params.order_amount.min),
                                max: math.round($scope.params.order_amount.max)
                            },
                            active: $scope.params.active,
                            modified_at: Globalutc.now()
                        };


                        if ($scope.place && $scope.place.lat !== undefined && $scope.place.lng !== undefined) {
                            post_data.location = { lat: $scope.place.lat, lng: $scope.place.lng };
                        }
                        if ($scope.params.rest_avg_prep_time && $scope.params.rest_avg_prep_time !== undefined) {
                            post_data.rest_avg_prep_time = $scope.params.rest_avg_prep_time;
                        }
                        if ($scope.params.snd_drvr_erly_mins && $scope.params.snd_drvr_erly_mins !== undefined) {
                            post_data.snd_drvr_erly_mins = $scope.params.snd_drvr_erly_mins;
                        }

                        firebase.database().ref('restaurant').child(restaurantId).update(post_data, function(error) {
                            callback(null, $scope.params.bns_usr_id, post_data.business_user_id, restaurantId);
                        }).catch(function(error) {
                            callback(error, null);
                        });
                    };

                    var updateBusinessUserAndgeoFire = function(bnsUsrId, businessUserId, restaurantId, callback) {
                        if (restaurantId) {

                            var business_user_data = {};
                            business_user_data[restaurantId] = true;
                            firebase.database().ref('business_user/' + businessUserId + '/restaurant/').update(business_user_data, function(error) {
                                if (error) {
                                    callback(error, null);
                                } else {
                                    if (bnsUsrId && businessUserId && bnsUsrId != businessUserId) {
                                        firebase.database().ref('business_user/' + bnsUsrId + '/restaurant/' + restaurantId).remove();
                                    }
                                }
                            });
                            callback(null, '');
                        } else {
                            callback(null, '');
                        }
                    };

                    async.waterfall([isExist, uploadFeaturedIcon, updateRestaurant, updateBusinessUserAndgeoFire], function(err, result) {
                        if (err !== null) {
                            $scope.toastrError(err, {});
                        } else {
                            $scope.toastrSuccess('Restaurant updated successfully.', {});
                            // $location.path('/ng/restaurant/list');
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    });
                }
            };

            //# Delete restaurant
            $scope.deleteRestaurant = function(restaurantId, businessUserId) {
                if ($window.confirm('Do you really want to delete this restaurant?')) {
                    if (restaurantId) {
                        firebase.database().ref('restaurant/' + restaurantId).remove(function(error) {
                            if (error) {
                                $scope.toastrError(error, {});
                            } else {
                                // firebase.database().ref('restaurant_opening_hours').child(restaurantId).remove();
                                if (businessUserId && businessUserId !== undefined) {
                                    firebase.database().ref('business_user/' + businessUserId + '/restaurant').child(restaurantId).remove();
                                }
                                $scope.toastrSuccess('Restaurant deleted successfully.', {});
                                $location.path('/ng/restaurant/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                    } else {
                        $scope.toastrError("Oppes! invalid restaurant", {});
                        $location.path('/ng/restaurant/list');
                        if (!$scope.$$phase) $scope.$apply();
                    }
                }
            };

            //Clear image while admin clicks remove button
            $scope.clearImage = function() {
                $scope.params.image = '';
                $scope.params.imagePath = '';
                angular.element('#imagePreviewThumbnail img').attr('src', $scope.noImagePath);
            };
            //Clear banner while admin clicks remove button
            $scope.clearBanner = function() {
                $scope.params.banner = '';
                $scope.params.bannerPath = '';
                angular.element('#bannerPreviewThumbnail img').attr('src', $scope.noImagePath);
            };

            //# restaurant contact listing here
            $scope.listOfRestaurantContact = {};
            $scope.totalRestaurantContact = 0;
            $scope.getRestaurantContactInfo = function() {
                var restaurantId = $stateParams.id;
                if (restaurantId) {
                    firebase.database().ref('restaurant/' + restaurantId).on("value", function(snapshot) {
                        var response = snapshot.val();
                        if (response) {
                            $scope.listOfRestaurantContact = response.contact_info;
                            if ($scope.listOfRestaurantContact) {
                                $scope.totalRestaurantContact = Object.keys($scope.listOfRestaurantContact).length;
                            } else {
                                $scope.totalRestaurantContact = 0;
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

            //# Open Add Restaurant Contact Modal
            $scope.animationsEnabled = true;
            $scope.addNewContactPopup = function(size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'add_new_contact',
                    controller: 'ResContactModalInstanceCtrl',
                    size: size,
                    resolve: {
                        restaurantId: function() {
                            return $stateParams.id;
                        },
                        conInfoId: function() {
                            return null;
                        },
                        listOfRestaurantContact: function() {
                            return null;
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                }, function() {
                    $scope.getRestaurantContactInfo();
                });
            };
            //# End

            //# Open Edit Restaurant Contact Modal
            $scope.animationsEnabled = true;
            $scope.updateContactPopup = function(con_info_id, size) {
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'update_contact',
                    controller: 'ResContactModalInstanceCtrl',
                    size: size,
                    resolve: {
                        restaurantId: function() {
                            return $stateParams.id;
                        },
                        conInfoId: function() {
                            return con_info_id;
                        },
                        listOfRestaurantContact: function() {
                            return $scope.listOfRestaurantContact[con_info_id];
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log(selectedItem);
                }, function() {
                    $scope.getRestaurantContactInfo();
                });
            };
            //# End

            //# Delete restaurant Contact details by id
            $scope.deleteResContact = function(restaurantId, restaurantConId) {
                if ($window.confirm('Do you really want to delete this contact?')) {
                    firebase.database().ref('restaurant/' + restaurantId + '/contact_info/' + restaurantConId).remove(function(error) {
                        if (error) {
                            $scope.toastrError(error, {});
                        } else {
                            $scope.toastrSuccess("Contact deleted successfully.", {});
                            $scope.getRestaurantContactInfo();
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    });
                }
            };

            //Format business-user-autocomplete text input while adding/editing restaurant
            $scope.formatLabel = function(model) {
                for (var i = 0; i < $scope.listOfRestaurantUser.length; i++) {
                    if (model === $scope.listOfRestaurantUser[i].id) {
                        // console.log($scope.listOfRestaurantUser[i].name);
                        return $scope.listOfRestaurantUser[i].name;
                    }
                }
            };

            //get market office of based on state
            $scope.marketOfficeCitites = [];
            $scope.getMarketOfficeCitiesByState = function(state) {
                // console.log(state);
                if(state){
                $scope.params.market_office_city_id = '';
                restaurantResource.get({
                    method: 'market-office-cities',
                    state: state
                }, function(response) {
                    if (response.error) {
                        $scope.marketOfficeCitites = [];
                    } else {
                        console.log(response.result.length);
                        if (response.result.length) {
                            response.result.unshift({
                                id: '',
                                city_name: 'All'
                            });
                            $scope.marketOfficeCitites = response.result;
                        } else {
                            $scope.marketOfficeCitites = [];
                        }
                    }
                });
                $scope.changeState(state);
                }else{
                    $scope.marketOfficeCitites = [];
                }
            };
            //Calculate service fee for restaurant (target-discount)
            $scope.calculateServiceFee = function() {
                if (angular.isDefined($scope.params.fdjts_trgt_pct) && $scope.params.fdjts_trgt_pct !== '' && angular.isDefined($scope.params.fdjts_disc_pct) && $scope.params.fdjts_disc_pct !== '') {
                    $scope.params.fdjts_trgt_pct = math.round($scope.params.fdjts_trgt_pct).toFixed(2);
                    $scope.params.fdjts_disc_pct = math.round($scope.params.fdjts_disc_pct).toFixed(2);
                    var rstrn_srv_fee_pct = math.round($scope.params.fdjts_trgt_pct - $scope.params.fdjts_disc_pct).toFixed(2);
                    $scope.params.rstrn_srv_fee_pct = (rstrn_srv_fee_pct >= 0) ? rstrn_srv_fee_pct : 0;
                } else {
                    $scope.params.rstrn_srv_fee_pct = '';
                }
            }

            $scope.init = function() {
                var stateInit = {
                    'ng.restaurant.add': function() {
                        $scope.restaurantUserList();
                        $scope.changedValue = function(stateCode) {
                            $scope.marketOfficeList(stateCode);
                        };

                        $scope.changedMktofficeValue = function(stateCode, marketOfficeId) {
                            $scope.marketOfficeCityList(stateCode, marketOfficeId);
                        };

                        $scope.changedMktofficeCityValue = function(stateCode, marketOfficeCityId) {
                            $scope.zoneList(stateCode, marketOfficeCityId);
                        };

                        $scope.placeChanged = function() {
                            var places = this.getPlace();
                            console.log('NNNNNNNNNNNNNNNN::' + JSON.stringify(places));
                            $scope.place = {
                                'lat': places.geometry.location.lat(),
                                'lng': places.geometry.location.lng()
                            };
                        };
                    },
                    'ng.restaurant.edit': function() {
                        $scope.restaurantUserList();
                        $scope.getRestaurantInfo();
                        $scope.changedValue = function(stateCode) {
                            $scope.marketOfficeList(stateCode);
                        };

                        $scope.changedMktofficeValue = function(stateCode, marketOfficeId) {
                            $scope.marketOfficeCityList(stateCode, marketOfficeId);
                        };

                        $scope.changedMktofficeCityValue = function(stateCode, marketOfficeCityId) {
                            $scope.zoneList(stateCode, marketOfficeCityId);
                        };

                        $scope.changedResUserStatus = function($event) {
                            if ($event) {
                                $scope.params.restaurantUser.status = true;
                            } else {
                                $scope.params.restaurantUser.status = false;
                            }
                        };

                        $scope.placeChanged = function() {
                            var places = this.getPlace();
                            $scope.place = {
                                'lat': places.geometry.location.lat(),
                                'lng': places.geometry.location.lng()
                            };
                        };
                    },
                    'ng.restaurant.list': function() {
                        // $scope.restaurantList();
                    },
                    'ng.restaurant.view-contact-info': function() {
                        $scope.getRestaurantContactInfo();
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

(function() {
    'use static';
    angular.module('FoodjetsApp').controller('ResContactModalInstanceCtrl', ['$scope', '$modalInstance', 'restaurantId', 'conInfoId', 'restaurantResource', 'listOfRestaurantContact',
        function($scope, $modalInstance, restaurantId, conInfoId, restaurantResource, listOfRestaurantContact) {
            $scope.contact_info = {};

            //# Add Restaurant Contact Details
            $scope.addRestaurantContact = function($valid) {
                if ($valid) {
                    firebase.database().ref('restaurant/' + restaurantId + '/contact_info').push().set($scope.contact_info).then(function() {
                        $scope.toastrSuccess('Contact added successfully.', {});
                        $modalInstance.dismiss('cancel');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError(error, {});
                    });
                }
            };

            //# Edit Restaurant Contact
            $scope.editRestaurantContact = function($valid) {
                if ($valid) {
                    firebase.database().ref('restaurant/' + restaurantId + '/contact_info/' + conInfoId).update($scope.contact_edit_info).then(function() {
                        $scope.toastrSuccess('Contact updated the menu.', {});
                        $modalInstance.dismiss('cancel');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError(error, {});
                    });
                }
            };

            if (listOfRestaurantContact) {
                $scope.contact_edit_info = {
                    title: listOfRestaurantContact.title,
                    name: listOfRestaurantContact.name,
                    email: listOfRestaurantContact.email,
                    cellphone_no: listOfRestaurantContact.cellphone_no
                };
            }

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };
        }
    ]);
})();

(function() {
    'use static';
    angular.module('FoodjetsApp').controller('SearchMenuCtrl', ['$scope', '$http', 'restaurantResource', '$stateParams',
        function($scope, $http, restaurantResource, $stateParams) {
            $scope.resOpningHoursButton = "save";
            $scope.resOpningHoursBox = false;

            $scope.start_time = new Date().toString();
            $scope.end_time = new Date().toString();

            $scope.hstep = 1;
            $scope.mstep = 15;

            $scope.options = {
                hstep: [1, 2, 3],
                mstep: [1, 5, 10, 15, 25, 30]
            };

            $scope.toggleMode = function() {
                $scope.ismeridian = !$scope.ismeridian;
            };

            //# Restaurant Opening Days
            $scope.mealPeriod = {};
            $scope.opening_hours = {};
            $scope.days = {
                sun: 'Sunday',
                mon: 'Monday',
                tue: 'Tuesday',
                wed: 'Wednesday',
                thu: 'Thursday',
                fri: 'Friday',
                sat: 'Saturday'
            };

            //# Restaurant menu list
            $scope.ophours = $scope.menus = {};
            $scope.getResMenuList = function() {
                firebase.database().ref("menu").on("value", function(snapshot) {
                    var resOpeningHours = {};
                    var resMenuTitle = [];
                    angular.forEach(snapshot.val(), function(value, key) {
                        resMenuTitle.push(value.title);
                        resOpeningHours[value.title] = {
                            id: key,
                            meal_period: value.meal_period
                        }
                    });
                    $scope.ophours = resOpeningHours;
                    $scope.menus = resMenuTitle;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(errorObject) {
                    console.log(error);
                    $scope.toastrError(errorObject.message, {});
                });
            }
            $scope.getResMenuList();
            //#End

            //# Restaurant Opening Hours Data
            $scope.menuId = 0;
            $scope.typeHeadSelected = function(ophours, $item) {
                $scope.mealPeriod = ophours[$item].meal_period || [];
                $scope.menuId = ophours[$item].id;
                var opening_hours = {};
                Object.keys($scope.days).forEach(function(k, v) {
                    var l = {};
                    Object.keys($scope.mealPeriod).forEach(function(k1, v1) {
                        l[k1] = {
                            start_time: $scope.start_time,
                            end_time: $scope.end_time
                        };
                    });
                    opening_hours[k] = l;
                });
                $scope.opening_hours = opening_hours;
                $scope.resOpningHoursBox = true;
            };
            //#End

            // $scope.changed_start_time = function(k, k1, val) {
            // console.log(val);
            // $scope.opening_hours[k][k1].start_time = val.toString();
            // if (!$scope.$$phase) $scope.$apply();
            // }

            // $scope.changed_end_time = function(k, k1, val) {
            // $scope.opening_hours[k][k1].end_time = val.toString();
            // if (!$scope.$$phase) $scope.$apply();
            // }

            //# Add Restaurant Opening Hours
            $scope.addResOpeningHours = function($valid) {
                // console.log($scope.opening_hours);
                if ($valid) {
                    var restaurant_id = $stateParams.id;
                    var menu_id = $scope.menuId;
                    var data = {};
                    var timeFlag = true;
                    var previous_end = null;
                    Object.keys($scope.opening_hours).forEach(function(k) {
                        var o = {};
                        // console.log(k);//fri
                        var cnt = 0;
                        var mealPeriodArray = Object.keys($scope.opening_hours[k]);
                        Object.keys($scope.opening_hours[k]).forEach(function(k1) {

                            var st_time = moment(new Date($scope.opening_hours[k][k1].start_time).toISOString()).unix();

                            var ed_time = moment(new Date($scope.opening_hours[k][k1].end_time).toISOString()).unix();

                            if (cnt > 0) {

                                var prev_end_time = moment(new Date($scope.opening_hours[k][mealPeriodArray[cnt - 1]].end_time).toISOString()).unix();

                                //any previous end time must be greater than current start time
                                if (st_time < prev_end_time) {
                                    timeFlag = false;
                                    console.log('Invalid prev time', $scope.opening_hours[k][k1]);
                                }
                            }
                            cnt++;
                            // console.log('Start time:',st_time);
                            // console.log('End time:',ed_time);

                            if (st_time < ed_time) {
                                o[k1] = {
                                    start_time: $scope.format.toHrMin($scope.opening_hours[k][k1].start_time),
                                    end_time: $scope.format.toHrMin($scope.opening_hours[k][k1].end_time)
                                };
                            } else {
                                // console.log(st_time);
                                // console.log(ed_time);
                                console.log('Invalid time', $scope.opening_hours[k][k1]);
                                timeFlag = false;
                            }


                        });
                        data[k] = o;
                    });
                    // console.log(timeFlag);
                    if (timeFlag === false) {
                        data = {};
                        $scope.toastrError('End time should be greater than start time', {});
                    } else {
                        if (restaurant_id && menu_id && $scope.opening_hours) {
                            // firebase.database().ref('restaurant_opening_hours/' + restaurant_id)

                            firebase.database().ref('restaurant/' + restaurant_id + '/opening_hours').set(data).then(function() {
                                var post_data = {
                                    current_menu_id: menu_id
                                };
                                firebase.database().ref('restaurant/' + restaurant_id).update(post_data).then(function() {}).catch(function(error) {
                                    console.log(error);
                                    $scope.toastrError(error, {});
                                });

                                if ($scope.resOpningHoursButton === 'save') {
                                    $scope.toastrSuccess("Opening hours added successfully.", {});
                                } else {
                                    $scope.toastrSuccess("Opening hours updated successfully.", {});
                                }
                            }).catch(function(error) {
                                console.log(error);
                                $scope.toastrError(error, {});
                            });
                        } else {
                            $scope.toastrError("Oppes! invalid restaurant", {});
                        }
                    }
                }
            };
            //#End

            $scope.format = {
                toHrMin: function(dateString) {
                    var myDate = new Date(dateString);
                    return myDate.getHours() + ':' + myDate.getMinutes();
                },
                toDt: function(hrmin) {
                    hrmin = hrmin.split(':');
                    var d = new Date();
                    d.setHours(parseInt(hrmin[0]), parseInt(hrmin[1]));
                    return d;
                }
            };

            //# Get Restaurant Opening Hours
            $scope.menu_title = "";
            $scope.getResOpeningHours = function() {
                var restaurantId = $stateParams.id;
                if (restaurantId) {
                    firebase.database().ref('restaurant/' + restaurantId).once('value').then(function(resResponse) {
                        var current_menu_id = resResponse.val().current_menu_id;
                        if (current_menu_id) {
                            firebase.database().ref('menu/' + current_menu_id).once('value').then(function(menuResponse) {
                                var menu_title = menuResponse.val().title;
                                firebase.database().ref('restaurant/' + restaurantId + '/opening_hours').once('value').then(function(ophResponse) {
                                    // firebase.database().ref('restaurant_opening_hours/' + restaurantId).once('value').then(function(ophResponse) {

                                    if (menu_title) {
                                        $scope.resOpningHoursBox = true;
                                        $scope.resOpningHoursButton = "update";
                                        $scope.menuId = current_menu_id;
                                        $scope.menu_title = menu_title;
                                        var opening_hours = ophResponse.val();
                                        var data = {};
                                        Object.keys(opening_hours).forEach(function(k) {
                                            var o = {};
                                            Object.keys(opening_hours[k]).forEach(function(k1) {
                                                o[k1] = {
                                                    start_time: $scope.format.toDt(opening_hours[k][k1].start_time),
                                                    end_time: $scope.format.toDt(opening_hours[k][k1].end_time)
                                                }

                                            });
                                            data[k] = o;
                                        });
                                        $scope.opening_hours = data;
                                        if (!$scope.$$phase) $scope.$apply();
                                    }
                                }).catch(function(error) {
                                    console.log(error);
                                    $scope.toastrError('Sorry!Some error occured!', {});
                                });
                            }).catch(function(error) {
                                console.log(error);
                                $scope.toastrError('Sorry!Some error occured!', {});
                            });
                        }
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError('Sorry!Some error occured!', {});
                    });
                }
            };
            $scope.getResOpeningHours();
        }
    ]);
})();
