(function() {
    'use strict';
    angular.module('FoodjetsApp').controller('MenuController', ['$rootScope',
        '$scope',
        '$http',
        '$stateParams',
        '$location',
        '$timeout',
        '$window',
        '$compile',
        '$state',
        'menuResource',
        'RTFoodJets',
        'FbSearchService',
        function($rootScope,
            $scope,
            $http,
            $stateParams,
            $location,
            $timeout,
            $window,
            $compile,
            $state,
            menuResource,
            RTFoodJets,
            FbSearchService) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.loaderValue = true;
            $scope.menus = {};
            $scope.items = {};
            $scope.menu_id = null;
            $scope.totalItems = 0;

            // Pagination setup start
            // $scope.numPerPage = 2;
            // $scope.currentPage = 1;
            // $scope.pageChanged = function() {
            //     $scope.menuList();
            // };
            // // Pagination setup end
            //
            // // Count total menus
            // $scope.menuCount = function() {
            //     firebase.database().ref('menu').on('value', function(snapshot) {
            //         $scope.totalItems = snapshot.numChildren();
            //         $scope.menuList();
            //     }, function(error) {
            //         console.log(error);
            //         $scope.toastrError('Sorry!Can not count menus.', {});
            //         $location.path('/ng/dashboard');
            //         if (!$scope.$$phase) $scope.$apply();
            //     });
            // };

            // Search menu list
            $scope.searchMenuList = function() {
                if (/\S+/.test($scope.searchText)) {

                    $scope.loaderValue = true;
                    FbSearchService.get({
                        q: $scope.searchText,
                        path: 'menu'
                    }, function(response) {
                        $scope.loaderValue = false;
                        if (Object.keys(response.result).length) {
                            $scope.errors = {
                                status: false,
                                msg: ''
                            };
                            $scope.menus = response.result;
                            $scope.totalItems = Object.keys($scope.menus).length;
                        } else {
                            $scope.menus = {};
                            $scope.errors = {
                                status: true,
                                msg: 'No record available'
                            };
                        }
                        $scope.totalItems = Object.keys($scope.menus).length;
                        if (!$scope.$$phase) $scope.$apply();
                    });

                } else {
                    $scope.menuList();
                }

            };


            // Fetch menus from firebase
            $scope.menuList = function() {

                $scope.loaderValue = true;

                firebase.database().ref('menu').orderByChild('title').on('value', function(snapshot) {
                    var response = [];
                    angular.forEach(snapshot.val(), function(value, key) {
                        value.id = key;
                        response.push(value);
                    });
                    $scope.menus = response;
                    $scope.totalItems = Object.keys($scope.menus).length;
                    $scope.loaderValue = false;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(error) {
                    console.log(error);
                    $scope.loaderValue = false;
                    $scope.toastrError('Sorry!Can not list menus.', {});
                    $location.path('/ng/dashboard');
                    if (!$scope.$$phase) $scope.$apply();
                });

            };

            //Add a new menu
            $scope.addMenu = function($valid) {
                if ($valid) {
                    var requestObject = {
                        'title': $scope.params.title,
                        'active': $scope.params.menu_active
                    };
                    var meal_periods = {};
                    angular.forEach($scope.params.meal_period, function(value, key) {
                        meal_periods[value.text] = true;
                    });
                    requestObject.meal_period = meal_periods;
                    var menu_categories = {};
                    angular.forEach($scope.params.menu_category, function(value, key) {
                        menu_categories[value.text] = true;
                    });
                    requestObject.menu_category = menu_categories;

                    firebase.database().ref('menu').push(requestObject).then(function() {
                        $scope.toastrSuccess('You have successfully added the menu.', {});
                        $location.path('/ng/menu/list');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError('Sorry!Can not add the menu.', {});
                    });
                }
            };

            //Fetch details of a menu by ID before updation
            $scope.getMenuInfo = function() {
                $scope.params = {};
                var menuID = $stateParams.id;
                if (menuID) {
                    firebase.database().ref('menu/' + menuID).once('value').then(function(snapshot) {
                        $scope.params.id = snapshot.key;
                        $scope.params.title = snapshot.val().title;
                        var meal_periods = [];
                        angular.forEach(snapshot.val().meal_period, function(value, key) {
                            meal_periods.push(key);
                        });
                        var menu_categories = [];
                        angular.forEach(snapshot.val().menu_category, function(value, key) {
                            menu_categories.push(key);
                        });
                        $scope.params.meal_period = meal_periods;
                        $scope.params.menu_category = menu_categories;
                        $scope.params.menu_active = (snapshot.val().active === true) ? true : false;
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError('Sorry!Some error occured!', {});
                        $location.path('/ng/menu/list');
                        if (!$scope.$$phase) $scope.$apply();
                    });
                } else {
                    $scope.toastrError('Unauthorized access!', {});
                    $location.path('/ng/menu/list');
                }
            };

            //Update details of the menu if everything is okay
            $scope.updateMenu = function($valid) {
                if ($valid) {
                    var requestObject = {
                        'title': $scope.params.title,
                        'active': $scope.params.menu_active
                    };
                    var meal_periods = {};
                    angular.forEach($scope.params.meal_period, function(value, key) {
                        meal_periods[value.text] = true;
                    });
                    requestObject.meal_period = meal_periods;
                    var menu_categories = {};
                    angular.forEach($scope.params.menu_category, function(value, key) {
                        menu_categories[value.text] = true;
                    });
                    requestObject.menu_category = menu_categories;
                    // console.log(requestObject);
                    firebase.database().ref('menu/' + $scope.params.id).set(requestObject).then(function() {
                        $scope.toastrSuccess('You have successfully updated the menu.', {});
                        $location.path('/ng/menu/list');
                        if (!$scope.$$phase) $scope.$apply();
                    }).catch(function(error) {
                        console.log(error);
                        $scope.toastrError('Can not update the record due to some error.', {});
                    });


                }
            };

            //delete menu by ID
            $scope.deleteMenu = function(menuID) {
                if (window.confirm('Do you really want to delete this menu?')) {
                    firebase.database().ref('menu/' + menuID).remove(function(error) {
                        if (error) {
                            $scope.toastrError('Information can not be deleted.', {});
                        } else {
                            $scope.toastrSuccess('You have successfully deleted a menu.', {});
                        }
                    });
                }
            };

            //Load tags to autocomplete category field
            $scope.loadCategoryTags = function(query) {
                return [{
                    'text': 'Breakfast'
                }, {
                    'text': 'Dinner'
                }, {
                    'text': 'Lunch'
                }, {
                    'text': 'Supper'
                }, {
                    'text': 'Snacks'
                }];
            };
            //Load tags to autocomplete meal-period field
            $scope.loadPeriodTags = function(query) {
                return [{
                    'text': '5am to 10am'
                }, {
                    'text': '6pm to 10pm'
                }, {
                    'text': '9am to 11pm'
                }];
            };

            //Reset menu form by button click
            $scope.resetMenuForm = function() {
                $scope.params.title = '';
                $scope.params.meal_period = [];
                $scope.params.menu_category = [];

                $scope.menuForm.$setPristine();
                $scope.menuForm.$setUntouched();
                // console.log($scope.params);

            };

            // Count total items
            $scope.itemCount = function() {
                $scope.menu_id = $stateParams.id;

                firebase.database().ref('menu_item/' + $scope.menu_id).on('value', function(snapshot) {
                    $scope.totalItems = snapshot.numChildren();
                    $scope.itemList($scope.menu_id);
                }, function(error) {
                    console.log(error);
                    $scope.toastrError('Sorry!Can not count items.', {});
                    $location.path('/ng/menu/');
                    if (!$scope.$$phase) $scope.$apply();
                });

            };

            //Fetch list of items
            $scope.itemList = function(menuID) {

                firebase.database().ref('menu_item/' + menuID).on('value', function(snapshot) {
                    var response = [];
                    // console.log(snapshot.val());
                    angular.forEach(snapshot.val(), function(value, key) {
                        value.id = key;
                        response.push(value);
                    });
                    $scope.items = response;
                    $scope.loaderValue = false;
                    if (!$scope.$$phase) $scope.$apply();
                }, function(error) {
                    console.log(error);
                    $scope.loaderValue = false;
                    $scope.toastrError('Sorry!Can not list items.', {});
                    $location.path('/ng/menu/');
                    if (!$scope.$$phase) $scope.$apply();
                });
            }

            //delete item by ID
            $scope.deleteItem = function(itemID) {
                if (window.confirm('Do you really want to delete this item?')) {
                    firebase.database().ref('menu_item/' + $scope.menu_id + '/' + itemID).remove(function(error) {
                        if (error) {
                            $scope.toastrError('Item can not be deleted.', {});
                        } else {
                            // $scope.init();
                            $scope.toastrSuccess('You have successfully deleted the item.', {});
                        }
                    });
                }
            };

            
            //Initializing controller functions
            $scope.init = function() {
                var stateInit = {
                    'ng.menu.list': function() {
                        // $scope.menuCount();
                        $scope.menuList();
                    },
                    'ng.menu.edit': function() {
                        $scope.getMenuInfo();
                        $scope.itemCount();
                        // $scope.fetchCategoryAndMealPeriod();

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
