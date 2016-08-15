(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('AddMultipleRestaurantController', [
        '$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        '$window',
        '$compile',
        '$state',
        '$modal',
        'FIREBASE_TOKEN',
        'RTFoodJets',
        'restaurantResource',
        'Globalutc',
        function($rootScope, $scope, $http, $stateParams, $location, $timeout, 
            $window, $compile, $state, $modal,FIREBASE_TOKEN,RTFoodJets,restaurantResource, Globalutc) {

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

            
            $scope.cuisine = [
                'Appetizers' , 'Beverage' , 'Chinese' , 'Desserts' , 'Indian' ,
                'Italian' , 'Mexican' , 'Salads' , 'Sandwiches' , 'Wraps' ,
                'Thai' , 'Utensil' , 'American' , 'Buffalo' , 'Cookies'
            ];

            $scope.cuisine_tag = ['Fastfood' , 'Snacks'];

            $scope.zonedata = {
                'BkMhvkmQ':true,
                'SJN0vk77':true,
                'Sy9pD1mm':true
            };

            $scope.contact_info = {
                '-KJ68214ry_Y2bzmXlGw' : {
                    cellphone_no: '(343) 242-3423',
                    email: 'dipu@foodjets.com',
                    name: 'Ettore\'s European Bakery',
                    title: 'Deepak Kumar'

                },
                '-KJGMK2Y6YBjoXzBigZA' : {
                    cellphone_no: '(234) 234-2342',
                    email: 'test_222@foodjets.com',
                    name: 'T & R Taste Of Texas BBQ',
                    title: 'Test'

                }
            };


            $scope.addMultipleRestaurant = function() {
                var n = 499;
                for (var i=0; i<n; i++) {
                    $http({ method: 'GET', url: 'https://randomuser.me/api/' }).
                      success(function (data, status, headers, config) {
                        console.log(data);


                        async.waterfall([ 
                            function(callback) {
                                var rs = data.results[0];
                                var post_data = {};
                                var rand = $scope.cuisine[Math.floor(Math.random() * $scope.cuisine.length)];
                                post_data = {
                                    name: rs.name.first+' '+rs.name.last+' '+rand,
                                    email: rs.email,
                                    contact_no: '4564564564',
                                    zip: rs.location.postcode,
                                    address: rs.location.street,
                                    fax_no: '234324234234',
                                    state_code: 'CA',
                                    cuisine_tag:$scope.cuisine_tag,
                                    market_office_id: 2,
                                    market_office_city_id: 2,
                                    zone: $scope.zonedata,
                                    business_user_id: 'STgd35brjPWFaJspAQsg4hHh5Il1',
                                    current_menu_id: '',
                                    banner: rs.picture.thumbnail,
                                    featured_note: 'T&R TASTE OF TEXAS',
                                    comment: 'Large flour tortilla filled with chicken, refried beans and cheese.',
                                    foodjets_percentage: 0,
                                    contact_info: $scope.contact_info,
                                    order_amount: {
                                        min: 5,
                                        max: 10
                                    },
                                    active: true,
                                    created_at: Globalutc.now(),
                                    modified_at: Globalutc.now()
                                };

                                firebase.database().ref('restaurant').push(post_data).then(function(data) {
                                    callback(null, post_data.business_user_id, data.key);
                                }).catch(function(error) {
                                    callback(error, null);
                                });
                            },
                            function(businessUserId, restaurantId, callback){
                                if(restaurantId){
                                    var business_user_data = {};
                                    business_user_data[restaurantId] =  true ;
                                    firebase.database().ref('business_user/'+businessUserId+'/restaurant').update(business_user_data, function(error) {
                                        if (error) {
                                            callback(error, null);
                                        }
                                    });

                                    //# adding lat,long to geoFire
                                    /*if($scope.place){
                                        var geoFire = new GeoFire(firebase.database().ref("restaurant_location"));
                                        geoFire.set(restaurantId, [35.20105, -91.8318334]).then(function() {
                                            callback(null, "Provided key has been added to GeoFire");
                                        }, function(error) {
                                            callback(error, null);
                                        });
                                    }*/
                                } else {
                                    callback();
                                }
                            }
                            ],function (err, result) {
                            if (err !== null) {
                                $scope.toastrError(err, {});
                            } else {
                                //$scope.toastrSuccess('Restaurant added successfully.', {});
                                //$location.path('/ng/restaurant/list');
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });

















                      }).
                      error(function (data, status, headers, config) {
                        // ...
                    });
                }

                
                /*$http({ method: 'GET', url: 'https://randomuser.me/api/' }).
                  success(function (data, status, headers, config) {
                    console.log(data);
                  }).
                  error(function (data, status, headers, config) {
                    // ...
                });*/
            };

            








            


            //# Add Restaurant
            $scope.addRestaurant = function($valid) {
                if ($valid) {
                    var isExist = function(callback) {
                        firebase.database().ref("restaurant").orderByChild('email').equalTo($scope.params.email).once("value", function(snapshot) {
                            if(snapshot.val()){
                                callback('Restaurant already exist with this email address.', null);
                            } else {
                                callback();
                            }
                        }, function (errorObject) {
                            callback(errorObject.message, null);
                        });
                    };

                    var uploadFeaturedIcon = function(callback) {
                        if ($scope.params.banner !== undefined && $scope.params.banner !== '') {
                            restaurantResource.save({
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
                            callback(null,'');
                        }
                    };

                    var addRestaurant = function(banner,callback) {
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
                                $scope.zonedata[value] =  true;
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
                            fax_no: ($scope.params.fax)?$scope.params.fax:'',
                            state_code: $scope.params.state_code,
                            cuisine_tag: $scope.params.cuisine_tag,
                            market_office_id: $scope.params.market_office_id,
                            market_office_city_id: $scope.params.market_office_city_id,
                            zone: $scope.zonedata,
                            business_user_id: $scope.params.business_user_id,
                            current_menu_id: '',
                            banner: banner,
                            featured_note: ($scope.params.featured_note)?$scope.params.featured_note:'',
                            comment: ($scope.params.comment)?$scope.params.comment:'',
                            foodjets_percentage: 0,
                            contact_info: [],
                            order_amount: {
                                min: $scope.params.order_amount.min,
                                max: $scope.params.order_amount.max
                            },
                            active: true,
                            created_at: Globalutc.now(),
                            modified_at: Globalutc.now()
                        };

                        firebase.database().ref('restaurant').push(post_data).then(function(data) {
                            callback(null, post_data.business_user_id, data.key);
                        }).catch(function(error) {
                            callback(error, null);
                        });
                    };

                    var updateBusinessUserAndgeoFire  = function(businessUserId, restaurantId,callback) {
                        if(restaurantId){
                            var business_user_data = {};
                            business_user_data[restaurantId] =  true ;
                            firebase.database().ref('business_user/'+businessUserId+'/restaurant').update(business_user_data, function(error) {
                                if (error) {
                                    callback(error, null);
                                }
                            });

                            //# adding lat,long to geoFire
                            if($scope.place){
                                var geoFire = new GeoFire(firebase.database().ref("restaurant_location"));
                                geoFire.set(restaurantId, [$scope.place.lat, $scope.place.lng]).then(function() {
                                    callback(null, "Provided key has been added to GeoFire");
                                }, function(error) {
                                    callback(error, null);
                                });
                            }
                        } else {
                            callback();
                        }
                    };

                    async.waterfall([ isExist,uploadFeaturedIcon,addRestaurant,updateBusinessUserAndgeoFire ],function (err, result) {
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

            

            
            $scope.init = function() {
                var stateInit = {
                    'ng.restaurant.multiple-restaurants': function() {
                        $scope.addMultipleRestaurant();
                        
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

