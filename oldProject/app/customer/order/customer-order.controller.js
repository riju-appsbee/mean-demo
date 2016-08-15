(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('CustomerOrderController', ['$rootScope',
        '$stateParams',
        '$state',
        '$modal',
        '$window',
        '$scope',
        '$http',
        '$location',
        '$timeout',
        'OrderService',
        'marketOffice',
        'marketOfficeCityService',
        'zoneService',
        'customerResource',
        'RTFoodJets',
        'Globalutc',
        '$cookies',
        'customerSavedAddressService',
        '$sessionStorage',
        'CartService',
        'Fmoment',
        'math',
        'RestaurantListing',
        function(
            $rootScope, $stateParams, $state, $modal, $window, $scope, $http,
            $location, $timeout, OrderService, marketOffice,
            marketOfficeCityService, zoneService,
            customerResource, RTFoodJets, Globalutc, $cookies,
            customerSavedAddressService, $sessionStorage, CartService, Fmoment, math, RestaurantListing) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.ifAddressBoxFocused = false;
            $scope.selected = undefined;
            $scope.customersSavedAddresses = {};

            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';

            // All object initialization
            $scope.place = {};
            $scope.marketOffices = {};
            $scope.marketOfficeCities = {};
            $scope.deliveryZones = {};
            $scope.restaurants = {};
            $scope.menuItems = {};
            $scope.amount = 0.00;
            $scope.finalObj = {};
            $scope.food = [];
            $scope.cart = [];
            $scope.zoneId = 0;
            $scope.cloud_url = 'https://foodjets-2-driver-image-dev.s3-us-west-1.amazonaws.com/';
            $scope.showCart = false;
            $scope.showOnProperAddressValidation = false;
            $scope.listOfRestaurant = $scope.restaurantLocalDb = {};
            $scope.nestedMenuItems = {};
            //$scope.currentQuantity = 0;
            $scope.totalModalAmount = 0.00;

            $scope.selected = undefined;

            $scope.addressList = customerSavedAddressService;

            // ### Step 1 Start

            // @flair
            $scope.customerInfo = {
                tmp_delivery_address: {},
                delivery_addresses: []
            };

            // Show delivery address dropdown
            $scope.showDeliveryAddresses = function() {
                $scope.ifAddressBoxFocused = true;
            };

            // hide delivery address dropdown
            $scope.hideDeliveryAddresses = function() {
                $scope.ifAddressBoxFocused = false;
            };

            // Check delivery address is new address or existing address
            $scope.checkDeliveryAddress = function(address) {
                var exist = null;
                _.each($scope.customerInfo.delivery_addresses, function(v) {
                    if (!!v.address && !!address.address && v.address.toLowerCase() === address.address.toLowerCase()) {
                        exist = v.id;
                    }
                });
                if (exist === null) {
                    return false;
                } else {
                    address.id = exist;
                    return address;
                }
            };

            // Go to 2nd step
            $scope.showRestaurantMenu = function(key) {
                if (!('zone_id' in $scope.customerInfo.tmp_delivery_address) || !('id' in $scope.customerInfo.tmp_delivery_address)) {
                    $scope.toastrError('Please select an address', {});
                } else if ($scope.listOfRestaurant[key].current_menu_id !== undefined && /\S+/.test($scope.listOfRestaurant[key].current_menu_id)) {
                    $scope.listOfRestaurant[key]._id = key;
                    CartService.addRequiredInfo($scope.customerInfo, $scope.listOfRestaurant[key]);
                    $state.go('ng.customer.order.checkout', {
                        resId: key
                    });
                } else {
                    $scope.toastrError('Restaurant menu not exist.', {});
                }

            };

            // Search restaurents on create order section
            $scope.searchRestaurant = function() {
                if (/\S+/.test($scope.searchText)) {
                    $scope.listOfRestaurant = _.reduce($scope.restaurantLocalDb, function(o, k, i) {
                        if (k.name.toLowerCase().includes($scope.searchText.toLowerCase()) || k.cuisine.toLowerCase().includes($scope.searchText.toLowerCase())) {
                            o[i] = k;
                        }
                        return o;
                    }, {});

                    if (!$scope.$$phase) $scope.$apply();

                } else {
                    $scope.listOfRestaurant = $scope.restaurantLocalDb;
                }
                // console.log($scope.listOfRestaurant);
                $scope.totalRestaurant = Object.keys($scope.listOfRestaurant).length;
            };

            // Save customer delivery address
            $scope.saveCustomerAddress = function() {
                if (!('zone_id' in $scope.customerInfo.tmp_delivery_address)) {
                    $scope.toastrSuccess('Please select an address', {});
                    return false;
                }

                customerResource.save({
                    'method': 'save-customer-address',
                    'params': {
                        state_code: $scope.customerInfo.tmp_delivery_address.state_code,
                        market_office_city_delivery_zone_id: $scope.customerInfo.tmp_delivery_address.zone_id,
                        latitude: $scope.customerInfo.tmp_delivery_address.latitude,
                        longitude: $scope.customerInfo.tmp_delivery_address.longitude,
                        customer_id: $scope.customerInfo.id,
                        address: $scope.customerInfo.tmp_delivery_address.address
                    }
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.customerInfo.tmp_delivery_address.id = response.result.id;
                        $scope.customerInfo.delivery_addresses.push($scope.customerInfo.tmp_delivery_address);
                        $scope.showOnProperAddressValidation = false;
                        $scope.toastrSuccess('Delivery address saved', {});
                    }
                });

            };

            $scope.clearCustomerAddress = function() {
                $scope.customerAddress = '';
                $scope.showOnProperAddressValidation = false;
            };

            // Populate Address In The Box For Saved Address
            $scope.populateAddressInTheBox = function(address) {
                // console.log(address);
                $scope.ifAddressBoxFocused = false;
                $scope.customerAddress = address.address;

                // Get zone info
                customerResource.get({
                    method: 'zone-info',
                    state_code: address.state_code,
                    zone_id: address.market_office_city_delivery_zone_id
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        address.zone_id = address.market_office_city_delivery_zone_id;
                        // delete address.market_office_city_delivery_zone_id;
                        $scope.getAllRestaurants(angular.merge(address, response.result));
                    }
                });

            };

            // Hadle emit event on new address selection
            $scope.$on('zone-info', function(event, zoneInfo) {
                if (_.isEmpty(zoneInfo)) {
                    return false;
                }
                $scope.getAllRestaurants(zoneInfo);
            });

            // Load customer data and saved delivery addresses
            $scope.getCustomerDeliveryAddress = function() {
                var customerId = $stateParams.customerId;

                //###### Fetching customer details
                if (!!customerId) {
                    customerResource.get({
                        method: 'customer-info',
                        id: customerId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.customerInfo.id = customerId;
                            $scope.customerInfo.phone = response.result.phone;
                            $scope.customerInfo.state_code = response.result.state_code;
                            $scope.customerInfo.internal_note = response.result.internal_note;
                            $scope.customerInfo.email = response.result.email;
                            $scope.customerInfo.address = response.result.address;
                            $scope.customerInfo.name = response.result.first_name + ' ' + response.result.last_name;
                        }
                    });

                    customerResource.get({
                        method: 'delivery-addresses',
                        id: customerId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.customerInfo.delivery_addresses = response.result[1];
                        }
                    });
                }

            };


            // Get restaurants for a specific state and zone_id
            $scope.getAllRestaurants = function(address) {
                if (!!address.timezone) {
                    Fmoment.setDTZ(address.timezone);
                }

                $scope.customerInfo.tmp_delivery_address = address;

                var zoneId = address.zone_id;
                var stateCode = address.state_code;

                $scope.restaurantLoaderValue = true;
                if (!!zoneId && !!stateCode) {
                    firebase.database().ref('restaurant').orderByChild('zone/' + stateCode + zoneId).equalTo(true).on('value', function(snapshot) {

                        // RestaurantListing
                        var res_list = new RestaurantListing(snapshot.val(), address);
                        $scope.restaurantLocalDb = $scope.listOfRestaurant = res_list.mapReduce();

                        $scope.restaurantLoaderValue = false;
                        var selectedAddress = $scope.checkDeliveryAddress(address);
                        if (!selectedAddress) {
                            $scope.showOnProperAddressValidation = true;
                        } else {
                            $scope.showOnProperAddressValidation = false;
                        }

                        if (!$scope.$$phase) $scope.$apply();
                    }, function(errorObject) {
                        $scope.toastrError(errorObject.message, {});
                    });
                } else {
                    $scope.restaurantLoaderValue = false;
                    $scope.toastrError('Please put a valid address to obtain restaurant list!!', {});
                }
            };


            // ## Step 1 end

            // ## Step 2 start

            $scope.restaurantInfo = {};
            $scope.customerInfo = {};

            $scope.activeTab = 0;

            // Watch on cart storage
            $scope.initcartWatch = function() {
                $scope.$watchCollection(function() {
                    return CartService.retrive();
                }, function(newVal) {
                    if (newVal) {
                        $scope.cartData = newVal;
                    }
                });
            };

            // # get restaurant details by id
            $scope.getRestaurantInfo = function() {
                var restaurantId = $stateParams.resId;
                var cartInfo = CartService.retrive();
                // console.log(cartInfo);
                $scope.restaurantInfo = cartInfo.restaurant_info || {};
                $scope.customerInfo = cartInfo.customer_info || {};

                if (cartInfo === undefined || restaurantId !== $scope.restaurantInfo._id) {
                    $scope.toastrError('Cart information mismatch', {});
                    $state.go('ng.customer.order.add', {
                        customerId: cartInfo.customer_id
                    });
                }

                if ('timezone' in cartInfo.delivery_address) {
                    Fmoment.setDTZ(cartInfo.delivery_address.timezone);
                }
                // var day = moment().format('ddd').toLowerCase();

                $scope.block('body', {});

                var delivery_address = $scope.customerInfo.tmp_delivery_address;
                delivery_address.phone = $scope.customerInfo.phone;
                delete delivery_address.customer_id;

                // Cart Service
                CartService.updateCart({
                    restaurant_id: $scope.restaurantInfo._id,
                    menu_id: $scope.restaurantInfo.current_menu_id,
                    delivery_address: delivery_address,
                    customer_id: $scope.customerInfo.id
                });
                $scope.getMenuInfo($scope.restaurantInfo.current_menu_id);

            };

            // Fetch details of a menu by ID before updation
            $scope.getMenuInfo = function(menuID) {

                var getMenu = function(cb) {

                    if (menuID) {
                        firebase.database()
                            .ref('menu/' + menuID).once('value').then(function(snapshot) {
                                $scope.meal_period = snapshot.val().meal_period;
                                $scope.menu_category = snapshot.val().menu_category;
                                cb(null, true);
                            }).catch(function(error) {
                                cb('Menu not found', null);
                            });
                    } else {
                        cb('Menu not found', null);
                    }
                };

                var getMenuItem = function(args, cb) {
                    if (menuID) {
                        firebase.database()
                            .ref('menu_item/' + menuID).on('value', function(snapshot) {
                                var menu_items = snapshot.val() || {};
                                var menu_items_Obj = {};
                                if (Object.keys(menu_items).length > 0) {
                                    Object.keys(menu_items).forEach(function(k) {

                                        if (menu_items[k].active === false)
                                            return;

                                        var x, y = [];
                                        if (typeof menu_items[k].meal_period === 'object') {
                                            x = _.pairs(menu_items[k].meal_period).filter(_.last).map(_.first);
                                        }
                                        if (typeof menu_items[k].menu_category === 'object') {
                                            y = _.pairs(menu_items[k].menu_category).filter(_.last).map(_.first);
                                        }
                                        if (x.length > 0) {
                                            x.forEach(function(k1) {
                                                menu_items_Obj[k1] = menu_items_Obj[k1] || {};
                                                if (y.length > 0) {
                                                    y.forEach(function(k2) {
                                                        menu_items_Obj[k1][k2] = menu_items_Obj[k1][k2] || {};
                                                        menu_items_Obj[k1][k2][k] = menu_items[k];
                                                    });
                                                }
                                            })
                                        }

                                    });

                                }

                                $scope.nestedMenuItems = menu_items_Obj;
                                // Auto select tab
                                $timeout(function() {
                                    $scope.activeTab = _.indexOf(_.keys(menu_items_Obj), $scope.restaurantInfo.is_open);
                                    // console.log($scope.activeTab);
                                }, 500);

                                if (!$scope.$$phase) $scope.$apply();
                                cb(null, true);
                            });
                    } else {
                        cb('Menu not found', null);
                    }
                };

                async.waterfall([getMenu, getMenuItem], function(err, result) {
                    try {
                        if (err !== null) {
                            $scope.toastrError(err, {});
                        }
                        // Reload Tab
                        $scope.reload = true;
                        $scope.unblock('body', {});
                        if (!$scope.$$phase) $scope.$apply();

                    } catch (e) {
                        $scope.toastrError('Sorry! can not list menus items.', {});
                    }

                });

            };

            // Remove Cart item
            $scope.removeCartItem = function(index) {
                if ($window.confirm('Do you really want to remove this item?')) {
                    if (CartService.removeFromCart(index)) {
                        $scope.toastrSuccess('Item removed from cart', {});
                    } else {
                        $scope.toastrError('This is not a valid item to delete', {});
                    }
                }
            };

            // Show meal period time on tab change
            $scope.mealPeriodSelect = function(periodKey) {
                if (periodKey in $scope.restaurantInfo.opening_hours) {
                    $scope.restaurant_deliver_hours = moment($scope.restaurantInfo.opening_hours[periodKey].start_time, 'HH:mm').format("h:mm A") + ' - ' + moment($scope.restaurantInfo.opening_hours[periodKey].end_time, 'HH:mm').format("h:mm A");

                    $scope.market_office_current_date = moment().format("M-D-YYYY");
                    $scope.market_office_current_time = moment().format("h:mm:ss A");
                }
            };

            // Create order go to 3rd steps
            $scope.createNewOrder = function() {

                $state.go('ng.customer.order.place-order');
                // if (angular.isDefined($scope.finalObj.delivery.address)) {
                //     $state.go('ng.customer.order.place-order');
                //
                // } else {
                //     $scope.toastrError("Please save a delivery address first!", {});
                //     $location.path('ng/order/add/' + $scope.finalObj.customer_id);
                // }
            };

            // ## Menu items Choices and Options popup
            $scope.animationsEnabled = true;
            $scope.open = function(itemKey, itemVal, periodKey) {
                // console.log($scope.restaurant_current_menu, periodKey);
                var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'optionChoicesPopup.html',
                    controller: 'OptionChoicesCtrl',
                    size: 'sm',
                    resolve: {
                        item: function() {
                            return {
                                id: itemKey,
                                details: itemVal,
                                canCheckout: (!$scope.restaurantInfo.is_closed && $scope.restaurantInfo.is_open === periodKey ? true : false)
                            };
                        }
                    }
                });

                modalInstance.result.then(function(itemcart) {
                    CartService.addToCart(itemcart);
                });

            };
            // Popup Animation
            $scope.toggleAnimation = function() {
                $scope.animationsEnabled = !$scope.animationsEnabled;
            };

            // Init state functions
            $scope.init = function() {

                //calling list if list page is called
                var stateInit = {
                    'ng.customer.order.add': function() {
                        CartService.resetCart();
                        $scope.getCustomerDeliveryAddress();
                    },
                    'ng.customer.order.checkout': function() {
                        $scope.initcartWatch();
                        $scope.getRestaurantInfo();
                    },
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
    'use strict';
    angular.module('FoodjetsApp').controller('OptionChoicesCtrl', ['$scope', '$modalInstance', 'item', 'CartService', 'Fmoment', 'math', function($scope, $modalInstance, item, CartService, Fmoment, math) {

        $scope.item = item;
        $scope.modalItem = {};
        $scope.now = Fmoment.unix();
        $scope.vrules = {};
        $scope.isValid = false;

        // Initiate item cart data
        $scope.itemcart = {
            id: item.id,
            qty: 1,
            total_price: parseFloat(item.details.retail_price),
            retail_price: parseFloat(item.details.retail_price),
            name: item.details.name,
            choices: {}
        };

        $scope.itemOn = function() {
            var itemCart = $scope.filterSelectedChoices($scope.modalItem);
            $scope.itemcart.choices = itemCart.choices;
            $scope.itemcart.total_price = itemCart.total_price;
            $scope.isValid = $scope.validate();
        };

        $scope.addToCart = function() {
            $scope.calculate();
            $modalInstance.close($scope.itemcart);

        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.calculate = function() {
            var itemCart = $scope.filterSelectedChoices($scope.modalItem);
            $scope.itemcart.choices = itemCart.choices;
            $scope.itemcart.total_price = itemCart.total_price;
        };

        $scope.incItemQuantity = function(quantity, itemId) {
            $scope.itemcart.qty = $scope.itemcart.qty + 1;
            $scope.calculate();
        };

        $scope.decItemQuantity = function(quantity, itemId) {
            if ($scope.itemcart.qty > 1) {
                $scope.itemcart.qty = $scope.itemcart.qty - 1;
            }
            $scope.calculate();
        };

        $scope.validate = function() {
            var isvalid = [];
            if (_.isEmpty($scope.vrules)) {
                return true;
            }

            _.each($scope.vrules, function(v, k) {
                if ((k in $scope.itemcart.choices) && $scope.itemcart.choices[k]['options'] !== undefined && Object.keys($scope.itemcart.choices[k].options).length >= v) {
                    isvalid.push(true);
                } else {
                    isvalid.push(false);
                }
            });

            // console.log(isvalid);

            if (isvalid.indexOf(false) === -1) {
                return true;
            } else {
                return false;
            }

        };

        $scope.filterSelectedChoices = function(modalItem) {

            modalItem = modalItem || {};
            var choices = {};
            var total_price = parseFloat(item.details.retail_price);

            var fetchOptionsInformations = function(option, stack) {

                if (!!stack && stack[option] !== undefined) {
                    total_price = total_price + parseFloat(stack[option].retail_price || 0);
                    return {
                        name: stack[option].name,
                        retail_price: stack[option].retail_price
                    };
                }
                return {};
            };

            var fetchChoiceInformations = function(k, v) {
                var choice = {};
                var options = {};

                if (typeof v === 'object') {
                    _.each(v, function(v1, k1) {
                        if (v1 === true) {
                            options[k1] = fetchOptionsInformations(k1, item.details.choices[k].options);
                        }

                    });
                } else {
                    options[v] = fetchOptionsInformations(v, item.details.choices[k].options);
                }

                if (!!item.details.choices && item.details.choices[k] !== undefined && !_.isEmpty(options)) {
                    choice.options = options;
                    choice.title = item.details.choices[k].title;
                }

                return choice;

            };

            _.each(modalItem, function(v, k) {
                var fc = fetchChoiceInformations(k, v);
                if (!_.isEmpty(fc)) {
                    choices[k] = fc;
                }
            });

            return {
                choices: choices,
                total_price: math.round(parseFloat(total_price) * parseInt($scope.itemcart.qty))
            };

        };


        $scope.createValidateRules = function() {

            var valid = {};

            _.each(item.details.choices, function(v, k) {
                var i = 0;
                if (v.required && !_.isEmpty(v.options)) {
                    _.each(v.options, function(v1, k1) {
                        if (v1.active && v1.soldout_expiry < Fmoment.unix()) {
                            i++;
                        }
                    });
                    if (i > 0) {
                        valid[k] = i > v.select ? v.select : i;
                    }
                }
            });

            $scope.vrules = valid;

        };

        $scope.createValidateRules();
        $scope.isValid = $scope.validate();

    }]);

})();




(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('CartService', ['$sessionStorage', 'math', function($sessionStorage, math) {
            var cart = {}
            if ($sessionStorage['cart'] === undefined) {
                cart = {
                    delivery_address: {},
                    food: [],
                    amount: {}
                };
            } else {
                cart = $sessionStorage.cart;
            }

            return {
                retrive: function() {
                    return cart;
                },
                addToCart: function(item) {
                    var c = cart;
                    if (item.id !== undefined) {
                        var index = c.food.push(item) - 1;
                        c = this.subtotal(c);
                        this.storeInStorage(c);
                        return index;
                    }
                },
                removeFromCart: function(index) {
                    var c = cart;
                    if (index !== undefined && c.food[index] !== undefined) {
                        var index = c.food.splice(index, 1);
                        c = this.subtotal(c);
                        this.storeInStorage(c);
                        return index;
                    }
                    return false;

                },
                subtotal: function(c) {
                    var total = 0;
                    _.each(c.food, function(v, k) {
                        if (!!v.total_price) {
                            total = parseFloat(total) + parseFloat(v.total_price);
                        }
                    });
                    c.amount.food_amount = math.round(total);
                    return c;
                },
                storeInStorage: function(c) {
                    $sessionStorage.cart = cart = c;
                },
                addRequiredInfo: function(customerInfo, restaurantInfo) {
                    var c = cart;
                    delete customerInfo.delivery_addresses;
                    c.customer_info = customerInfo;
                    c.restaurant_info = restaurantInfo;
                    this.storeInStorage(c);
                },
                updateCart: function(data) {
                    var c = cart;
                    _.each(data, function(v, k) {
                        c[k] = v;
                    });
                    this.storeInStorage(c);
                },
                resetCart: function() {
                    this.storeInStorage({
                        delivery_address: {},
                        food: [],
                        amount: {}
                    });
                }

            };


        }]);

})();
