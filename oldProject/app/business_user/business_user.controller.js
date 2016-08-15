(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('BusinessUserController', [
        '$rootScope',
        '$scope',
        '$http',
        '$timeout',
        '$location',
        '$stateParams',
        '$state',
        '$window',
        '$compile',
        'FIREBASE_TOKEN',
        'RTFoodJets',
        'businessUserService',
        'businessResource',
        'marketOffice',
        'cityFactory',
        'GlobalVar',
        function(
            $rootScope,
            $scope,
            $http,
            $timeout,
            $location,
            $stateParams,
            $state,
            $window,
            $compile,
            FIREBASE_TOKEN,
            RTFoodJets,
            businessUserService,
            businessResource,
            marketOffice,
            cityFactory,
            GlobalVar) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            //########## pagination variables starts
            $scope.totalUsers = 0;
            $scope.numPerPage = 1;
            $scope.searchText = '';
            $scope.info = {};
            $scope.params = {};
            $scope.businessDetails = [];
            $scope.states = GlobalVar.states();
            //get market office of based on state
            $scope.marketOffice = [];
            $scope.getMarketOffice = function(state) {
                $scope.params.market_office_id = 'All';
                // console.log(state);return;
                cityFactory.getAll(state, function(err, response) {
                    // console.log(response);
                    
                    if (err === true) {
                        $scope.marketOffice = [];
                        $scope.toastrError('No Market Office Found Under This State.', {});
                    } else {
                        response.unshift({ office_name: 'All' });
                        // console.log($scope.marketOffice);
                        $scope.marketOffice = response;
                        // $scope.market_office_id = '';
                    }
                    

                });
            };



            // Pagination setup strat
            $scope.currentPage = 1;

            $scope.businessUserList = function() {
                if (!!$scope.params.market_office_state_code) {
                    $scope.info = {};
                    $scope.loaderValue = true;
                    
                    // if ($scope.searchText !== '') {
                        // var textToSearch = $scope.searchText;
                        businessUserService.get({
                            q: $scope.searchText,
                            state: $scope.params.market_office_state_code || '',
                            city: $scope.params.market_office_id || '',
                            path: 'business_user'
                        }, function(response) {
                            if (response.result) {
                                $scope.info = response.result;
                                $scope.loaderValue = false;
                                $scope.totalUsers = Object.keys(response.result).length;
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        });
                    // } else {
                    //     //$scope.loaderValue = true;
                    //     var ref = firebase.database().ref('business_user');
                    //     ref.on('value', function(data) {
                    //         $scope.loaderValue = false;
                    //         $scope.info = data.val();
                    //         // console.log($scope.info.length);
                    //         $scope.totalUsers = Object.keys(data.val() || {}).length;
                    //         if (!$scope.$$phase) $scope.$apply();
                    //     });
                    // }
                } else {
                    $scope.toastrError('Please select state.', {});
                }

            };

            $scope.businessUserSearch = function() {
                var textToSearch = $scope.searchText;
                businessUserService.query({ q: textToSearch, path: 'business_user' }, function(response) {
                    if (response.result) {
                        $scope.info = response.result;
                        if (!$scope.$$phase) $scope.$apply();
                    }
                });


            };

            /*
            $scope.businessUserList = function(){
                $scope.info = {};
                var lastkey = Object.keys($scope.info);
                var limit = $scope.numPerPage;
                var ref = firebase.database().ref('business_user');
                //var usersQuery = ref1.limit(2);
                ref.on('child_added', function(data) {
                    //console.log(data.key+"///"+data.val().email);
                  //$scope.info = data.val();
                  data.forEach(function(value) {
                     $scope.info[data.key] = value.val();
                  });
                  if (!$scope.$$phase) $scope.$apply();
                  console.log($scope.info);

                });

            };
            */


            $scope.addBusinessUser = function(params) {
                if (params) {
                    // console.log(params);return;
                    var email = params.businessUser.email;
                    var password = params.businessUser.password;
                    var first_name = params.businessUser.first_name;
                    var last_name = params.businessUser.last_name;
                    var phone = params.businessUser.phone;
                    var address = params.businessUser.address;
                    var city = params.businessUser.city;
                    var state = params.businessUser.state;
                    var zip_code = params.businessUser.zip_code;

                    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(resp) {
                        if (!!resp.uid) {
                            var ref = firebase.database().ref('business_user/' + resp.uid);
                            ref.set({
                                first_name: first_name,
                                last_name: last_name,
                                email: email,
                                phone: phone,
                                address: address,
                                city: city,
                                state: state,
                                zip_code,
                                active: true,
                            });
                        }
                        $scope.toastrSuccess('You have successfully added the user.', {});
                    }).catch(function(error) {

                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;

                        $scope.toastrError(errorMessage, {});
                        // ...
                    });
                    $location.path('/ng/business-user/list');
                }
            };

            $scope.getBusinessUserDetails = function() {
                var userId = $stateParams.id;
                $scope.params = $scope.params || {};

                //var userId = firebase.auth().currentUser.uid;
                $scope.restaurants = {};

                var fetchbusinessUserDetails = function(callback) {

                    firebase.database().ref('/business_user/' + userId).once('value').then(function(data) {
                        //var username = snapshot.val().username;
                        // ...
                        //console.log(data.val());
                        $scope.params.first_name = data.val().first_name;
                        $scope.params.last_name = data.val().last_name;
                        $scope.params.email = data.val().email;
                        $scope.params.phone = data.val().phone;
                        $scope.params.address = data.val().address;
                        $scope.params.city = data.val().city;
                        $scope.params.state = data.val().state;
                        $scope.params.zip_code = data.val().zip_code;
                        $scope.params.password = data.val().password;
                        $scope.params.status = (data.val().active === true) ? true : false;
                        // $scope.restaurants = data.val().restaurant;
                        callback(null, data.val().restaurant);
                        // if (!$scope.$$phase) $scope.$apply();
                    });

                };
                var fetchBusinessDetails = function(restaurants, callback) {
                    $scope.businessDetails = [];
                    angular.forEach(restaurants, function(v, resID) {
                        // console.log(resID);
                        if (resID) {
                            firebase.database().ref('/restaurant/' + resID).once('value').then(function(resDetails) {
                                // console.log(resDetails.val().name);
                                $scope.businessDetails.push(resDetails.val().name);
                            });
                        }
                    });
                    callback(null, 'success');
                };



                async.waterfall([fetchbusinessUserDetails, fetchBusinessDetails], function(err, result) {
                    if (err !== null) {
                        console.log(err);
                        $scope.toastrError(err, {});
                    } else {
                        $timeout(function() {
                            if (!$scope.$$phase) $scope.$apply();
                        }, 1000);
                    }
                });
            };

            $scope.saveBusinessUser = function(params) {
                var userId = $stateParams.id;
                var oldEmail = "";
                var requestInputs = {};
                //if(params.password) {
                requestInputs.email = params.email;
                requestInputs.first_name = params.first_name;
                requestInputs.last_name = params.last_name;
                requestInputs.active = params.status;
                requestInputs.phone = params.phone;
                requestInputs.address = params.address;
                requestInputs.city = params.city;
                requestInputs.state = params.state;
                requestInputs.zip_code = params.zip_code;

                //############### Fetching old email of this user
                firebase.database().ref('/business_user/' + userId).once('value').then(function(data) {
                    oldEmail = data.val().email;
                });

                //############### updating user information
                firebase.database().ref('/business_user/' + userId).update(requestInputs).then(function(data) {
                    console.log(data);
                    $scope.toastrSuccess('You have successfully updated the user.', {});
                }).catch(function(error) {
                    $scope.toastrError('Can not update the record due to some error.', {});
                });
                $location.path('/ng/business-user/list');
                //}
            };

            //delete user by ID
            $scope.deleteBusinessUser = function(userId) {
                if (window.confirm('Do you really want to delete this user?')) {
                    firebase.database().ref('business_user/' + userId).remove(function(error) {
                        if (error) {
                            $scope.toastrError('Information can not be deleted.', {});
                        } else {
                            $scope.toastrSuccess('You have successfully deleted this user.', {});
                        }
                    });
                }
            };

            $scope.fetchAllStates = function() {
                $scope.params.market_office_state_code = 'All';
                businessResource.get({
                    method: 'state-list'
                }, function(response) {
                    // console.log(response);
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        response.result.unshift({ State: 'All' });
                        // console.log(response.result);
                        $scope.allStates = response.result;
                    }
                });
            };
            $scope.fetchAllCities = function() {
                businessResource.get({
                    method: 'city-list'
                }, function(response) {
                    // console.log(response);
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        // console.log(response.result);
                        $scope.allCities = response.result;
                    }
                });
            };

            $scope.init = function() {
                var stateInit = {
                    'ng.business-user.list': function() {
                        // $scope.businessUserList();
                        $scope.fetchAllStates();
                        $scope.fetchAllCities();
                    },
                    'ng.business-user.add': function() {
                        $scope.fetchAllStates();
                        $scope.fetchAllCities();
                    },
                    'ng.business-user.edit': function() {
                        $scope.fetchAllStates();
                        $scope.fetchAllCities();
                        $scope.getBusinessUserDetails();
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
