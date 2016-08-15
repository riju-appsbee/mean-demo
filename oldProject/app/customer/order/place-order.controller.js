(function() {
'use strict';

angular.module('FoodjetsApp').controller('PlaceOrderController', [
    '$rootScope',
    '$stateParams',
    '$state',
    '$modal',
    '$window',
    '$scope',
    '$http',
    '$location',
    'marketOffice',
    'marketOfficeCityService',
    'zoneService',
    'customerResource',
    'RTFoodJets',
    'Globalutc',
    '$cookies',
    '$sessionStorage',
    'CartService',
    'math',
    'Fmoment',
    'cardService',
    function(
        $rootScope, $stateParams, $state, $modal, $window, $scope, $http,
        $location, marketOffice,
        marketOfficeCityService, zoneService,
        customerResource, RTFoodJets, Globalutc, $cookies,
        $sessionStorage, CartService, math, Fmoment, cardService) {

        //######### set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
        $scope.otherTips = false;

        //######### All object initialization
        $scope.finalObj = {};
        $scope.cardData = {};
        $scope.params = {};
        $scope.finalObj.card_info = {};
        $scope.tax_percentage = 0.00;
        $scope.tax_amount = 0.00;
        $scope.totalPlusTax = 0.00;
        $scope.foodAmount = 0.00;
        $scope.tipsValue = 0.00;
        $scope.promo_amount = 0.00;
        $scope.activeValue = '10';
        $scope.grandTotal = 0.00;
        $scope.customer_credit_amount = 0.00;
        $scope.credit_amount_applied = 0.00;
        $scope.creditCardInfo = [];

        $scope.$watch(function() {
            return cardService.retrieve();
        }, function(newVal) {
            if (newVal) {
                $scope.cardData = newVal;
            }
            $scope.creditCardInfo.push($scope.cardData);
        });

        //######## Fetch data stored in session from first and second step
        $scope.checkSessionStorage = function() {
            if ($sessionStorage.cart !== undefined) {
                $scope.finalObj = CartService.retrive();

                console.log($scope.finalObj);
                
                //initializing amount object
                $scope.finalObj.amount.promo_amount = 0.00;
                $scope.finalObj.amount.promo_code = '';
                $scope.finalObj.amount.credit_amount = 0.00;
                $scope.finalObj.amount.tax_percentage = 0.00;
                $scope.finalObj.amount.tax_amount = 0.00;
                $scope.finalObj.amount.total_amount = 0.00;
                $scope.finalObj.amount.tips_percentage = 0.00;
            }
        };

        //######## Call this function when clicking on other option in tips
        $scope.otherTipsOptionShow = function() {
            $scope.otherTips = true;
            $scope.activeValue = 'other';
        };

        //######## Canculating promo discount amount
        $scope.checkPromoDiscount = function(promo_code) {
            $scope.promo_amount = 0.00;
            var type = 'Percentage';
            var currentFoodVal = $scope.finalObj.amount.food_amount;
            if (promo_code.length > 0) {

                //## Checking if promo code already applied or not
                //$scope.checkPromoAlreadyUsed();

                var zoneid = $scope.finalObj.delivery_address.zone_id;
                var stateCode = $scope.finalObj.delivery_address.stateCode ?
                 $scope.finalObj.delivery_address.stateCode : 'CA';
                if ($scope.finalObj.amount.credit_amount && $scope.finalObj.amount.credit_amount > 0) {
                    currentFoodVal = math.round(parseFloat(currentFoodVal) + 
                                    parseFloat($scope.finalObj.amount.credit_amount));
                    $scope.credit_amount_applied = 0;
                    $scope.finalObj.amount.credit_amount = 0.00;
                }
                var params = {};
                params.customer_id = $scope.finalObj.customer_info.id;
                params.promo_code = promo_code;
                params.order_amount = math.round($scope.finalObj.amount.food_amount);
                params.state_code = stateCode;
                params.zone_id = zoneid;
                customerResource.save({
                    method: 'promo-redeem',
                    params: params
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        if (response.result && response.result.amount) {
                            type =  response.result.type;
                            if(type === 'Percentage') {
                                $scope.promo_amount     = math.round((currentFoodVal * response.result.amount) / 100);
                            } else {
                                $scope.promo_amount     = math.round(response.result.amount);
                            }
                            $scope.promo_code 		= promo_code;
                            console.log('FOOOOD: ',currentFoodVal);
                            $scope.setOrderForm();
                        }
                    }
                });
            } else {
                $scope.toastrError('Please enter promo code', {});
            }
        };

        /*$scope.checkPromoAlreadyUsed = function() {
            if($scope.finalObj.amount.promo_code !== '' && $scope.finalObj.amount.promo_amount > 0) {
                $scope.foodAmount = math.round(parseFloat($scope.finalObj.amount.food_amount) + 
                                    parseFloat($scope.finalObj.amount.promo_amount));
                $scope.finalObj.amount.promo_amount = 0.00;
                $scope.finalObj.amount.promo_code = '';
            }
        };*/

        //######## Calculating credit amount if applied by user
        $scope.checkCreditDiscount = function(credit_amount) {
            $scope.credit_amount_applied = 0.00;
            var orderAmount = math.round(parseFloat($scope.finalObj.amount.food_amount));
            if($scope.finalObj.amount.promo_code !== '' && $scope.finalObj.amount.promo_amount > 0) {
                orderAmount = math.round(parseFloat(orderAmount) - 
                                    parseFloat($scope.finalObj.amount.promo_amount));
            }

            /*if($scope.finalObj.amount.credit_amount > 0) {
                orderAmount = math.round(parseFloat(orderAmount) + 
                                    parseFloat($scope.finalObj.amount.credit_amount));
                $scope.finalObj.amount.credit_amount = 0.00;
            }*/

            if (credit_amount.length > 0) {
                var stateCode = $scope.finalObj.delivery_address.stateCode ?
                 $scope.finalObj.delivery_address.stateCode : 'CA';
                var params = {};
                params.id = $scope.finalObj.customer_info.id;
                params.credit_amount = credit_amount;
                //params.order_amount = $scope.grandTotal;
                params.order_amount = orderAmount;
                params.state_code = stateCode;
                customerResource.save({
                    method: 'credit-amount-redeem',
                    params: params
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error, {});
                    } else {
                        if (response.result) {
                            $scope.toastrSuccess('Credit applied successfully.', {});
                            $scope.credit_amount_applied     = math.round(response.result.value);
                            console.log('FOOOOD: ',$scope.foodAmount);
                            console.log('credit_amount: ',$scope.finalObj.amount.credit_amount);
                            $scope.setOrderForm();
                        }
                    }
                });
            } else {
                $scope.toastrError('Please enter credit amount for discount', {});
            }
        };

        //######## Create a new order from third step 
        $scope.createNewOrder = function() {
            console.log($scope.finalObj);
            delete $scope.finalObj.customer_info;
            delete $scope.finalObj.restaurant_info;
            if (angular.isDefined($scope.finalObj.delivery_address.address)) {
                if ($scope.params.note) {
                    $scope.finalObj.delivery_address.note = $scope.params.note;
                }
                if(_.isEmpty($scope.finalObj.card_info)) {
                    $scope.toastrError('Please select a card for payment!', {});
                } else {
                    customerResource.save({
                        'method': 'create-order',
                        'params': $scope.finalObj
                    }, function(response) {
                        $sessionStorage.$reset();
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess('Order successfully placed.', {});
                            //console.log(response.result);
                            //$location.path('ng/customer/order/add/' + $scope.finalObj.customer_id);
                            $location.path('ng/customer/order/order-confirmation/'+response.result.order_number);
                        }
                    });
                }
            } else {
                $scope.toastrError('Please save a delivery address first!', {});
                $location.path('ng/customer/order/add/' + $scope.finalObj.customer_info.id);
            }
        };

        $scope.getSelectedCard = function(cardId) {
            if(cardId) {
                $scope.finalObj.card_info = {id:cardId}; 
            }
        };

        /*
        *   This function will be called when $scope init function will be called.
        *   Its calculating tax percentage
        */
        $scope.getTaxPercentage = function() {
            console.log($scope.finalObj);

            if ($scope.finalObj) {
                var zipcode = $scope.finalObj.delivery_address.zipcode?
                $scope.finalObj.delivery_address.zipcode:null;

                var stateCode = $scope.finalObj.delivery_address.stateCode ?
                $scope.finalObj.delivery_address.stateCode : 'CA';

                var marketOffice = $scope.finalObj.delivery_address.market_office_id;
                var params = {};
                params.state_code = stateCode;
                params.zipcode = zipcode;
                params.marketOffice = marketOffice;
                if (stateCode) {
                    customerResource.save({
                        'method': 'get-tax-percentage',
                        'params': params
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            console.log('TAX : ',response.result);
                            if(response.result.combined_rate && response.result.combined_rate !== undefined) {
                                $scope.tax_percentage = math.round(response.result.combined_rate * 100);
                            }
                            if(response.result.tax_percentage && response.result.tax_percentage !== undefined) {
                                $scope.tax_percentage = math.round(response.result.tax_percentage * 100);
                            }
                            $scope.finalObj.amount.tax_percentage = $scope.tax_percentage;
                            $scope.setOrderForm();
                        }
                    });
                } else {
                    $scope.toastrError('', {});
                }
            }
        };

        /*
        *   This function will be called when $scope init function will be called.
        *   Its fetching customer credit amount
        */
        $scope.getCustomerCredit = function() {
            customerResource.get({
                method: 'get-customer-credit',
                id: $scope.finalObj.customer_info.id
            }, function(response) {
                if (response.error) {
                    $scope.toastrError(response.error.message, {});
                } else {
                    if(!_.isEmpty(response.result)) {
                        $scope.customer_credit_amount = math.round(response.result.credit);
                    }
                }
            });
        };

        /*
        *   This function will be called when $scope init function will be called.
        *   Its fetching customer credit card information
        */
        $scope.getCustomerCreditCardInfo = function() {
            customerResource.get({
                method: 'get-customer-credit-card-info',
                id: $scope.finalObj.customer_info.id
            }, function(response) {
                if (response.error) {
                    $scope.toastrError(response.error.message, {});
                } else {
                    if(!_.isEmpty(response.result)) {
                        $scope.creditCardInfo = response.result;
                    }
                }
            });
        };

        /*
        *   This function will be called when $scope init function will be called.
        *   Its the main function.It's calculating promo amount , credit amount , tax amount 
        *   and total amount after tax applied
        */
        $scope.setOrderForm = function() {
            $scope.foodAmount = math.round(parseFloat($scope.finalObj.amount.food_amount));
            //var $scope.foodAmount = $scope.foodAmount || 0.00;
            if ($scope.promo_amount && $scope.promo_amount > 0) {
                $scope.foodAmount = math.round(parseFloat($scope.foodAmount) - parseFloat($scope.promo_amount));
                $scope.finalObj.amount.promo_amount = $scope.promo_amount;
                $scope.finalObj.amount.promo_code = $scope.promo_code;
            }

            if ($scope.credit_amount_applied && $scope.credit_amount_applied > 0) {
                
                if($scope.credit_amount_applied <= $scope.foodAmount) {
                    $scope.credit_amount_applied = $scope.credit_amount_applied;
                }
                else {
                    var promoCreditTotal = math.round(parseFloat($scope.promo_amount) + 
                                       parseFloat($scope.credit_amount_applied));
                    var diff = math.round(parseFloat(promoCreditTotal) - parseFloat($scope.foodAmount));
                    $scope.credit_amount_applied = diff;
                }
                /* *******OLD**********
                if ($scope.promo_amount > 0 && $scope.promo_amount < $scope.credit_amount_applied) {
                    $scope.credit_amount_applied = parseFloat($scope.credit_amount_applied) - parseFloat($scope.promo_amount);
                    $scope.credit_amount = $scope.credit_amount_applied;
                }*/
                $scope.foodAmount = math.round(parseFloat($scope.foodAmount) - 
                                    parseFloat($scope.credit_amount_applied));
                $scope.finalObj.amount.credit_amount = $scope.credit_amount_applied;
            }

            if ($scope.tax_percentage && $scope.tax_percentage > 0) {
                $scope.tax_amount = math.round(parseFloat((parseFloat($scope.foodAmount) * 
                                    $scope.tax_percentage) / 100));
                $scope.finalObj.amount.tax_percentage = $scope.tax_percentage;
                $scope.finalObj.amount.tax_amount = $scope.tax_amount;
            }
            $scope.totalPlusTax = math.round(parseFloat($scope.foodAmount) + parseFloat($scope.tax_amount));
            if($scope.otherTips === false) {
                $scope.tipsCalculation(10);
            } else {
                $scope.otherTipsCalculate($scope.other_tips);
            }
            //$scope.foodAmount = $scope.foodAmount;
            console.log($scope.finalObj);
        };

        /*
        *   This function will be called when other option is been clicked
        *   This function will only take tips amount(Flat) as input
        */
        $scope.otherTipsCalculate = function(tipsAmount) {
            $scope.activeValue = 'other';
            $scope.tipsValue = tipsAmount;
            $scope.grandTotal = math.round(parseFloat($scope.totalPlusTax) + parseFloat($scope.tipsValue));
            $scope.finalObj.amount.total_amount = $scope.grandTotal;
            $scope.finalObj.amount.tips_percentage = 0;
            $scope.finalObj.amount.tips_amount = parseFloat(tipsAmount);
        };

        /*
        *   This function will be called when any tips percentage (10% , 20%) option is been clicked
        *   This function will only take tips percentage as input
        */
        $scope.tipsCalculation = function(percentage) {
            $scope.otherTips = false;
            $scope.activeValue = percentage;
            $scope.tipsValue = math.round(parseFloat((parseFloat($scope.totalPlusTax) * percentage) / 100));
            $scope.grandTotal = math.round(parseFloat($scope.totalPlusTax) + parseFloat($scope.tipsValue));
            $scope.finalObj.amount.total_amount = $scope.grandTotal;
            $scope.finalObj.amount.tips_percentage = percentage;
            $scope.finalObj.amount.tips_amount = parseFloat($scope.tipsValue);
        };

        $scope.init = function() {
            var stateInit = {
                'ng.customer.order.place-order': function() {
                    $scope.checkSessionStorage();
                    $scope.getTaxPercentage();
                    $scope.setOrderForm();
                    $scope.getCustomerCredit();
                    $scope.getCustomerCreditCardInfo();
                }
            };

            if (stateInit[$state.$current.name] !== undefined) {
                stateInit[$state.$current.name]();
            }
        };

        $scope.init();

        $scope.animationsEnabled = true;

        /*
        *   This modal option is for change phone number
        *   @input : phone number and customer id
        */
        $scope.open = function(phoneNumber, customerId) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'changePhoneNumber.html',
                controller: 'ModalInstanceController',
                size: 'sm',
                resolve: {
                    item: function() {
                        return {
                            id: customerId,
                            phone: phoneNumber
                        };
                    }
                }
            });

            modalInstance.result.then(function(userInfo) {
                $scope.userInfo = userInfo;
                console.log('User Info' , $scope.userInfo);
            });

        };

        /*
        *   This modal option is for change address
        *   @input : address and customer id
        */
        $scope.changeAddress = function(address, customerId) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'changeAddress.html',
                controller: 'changeAddressController',
                size: 'sm',
                resolve: {
                    info: function() {
                        return {
                            address: address,
                            id: customerId
                        };
                    }
                }
            });

            modalInstance.result.then(function(userInfo) {
                $scope.userInfo = userInfo;
            });

        };

        /*
        *   This modal option is for add credit card
        *   @input : customer id
        */
        $scope.addCard = function(customerId) {
            var modalInstance = $modal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'addCard.html',
                controller: 'addCardController',
                size: 'sm',
                resolve: {
                    info: function() {
                        return {
                            id: customerId
                        };
                    }
                }
            });

            modalInstance.result.then(function(userInfo) {
                $scope.userInfo = userInfo;
            });

        };

    }
]);

})();


(function() {
    'use strict';
    angular.module('FoodjetsApp').controller('ModalInstanceController', [
    	'$rootScope',
	    '$stateParams',
	    '$state',
	    '$modal',
	    '$window',
	    '$scope',
	    '$http',
	    '$location',
	    '$modalInstance',
	    'item',
	    'customerResource',
	    'CartService',
	    function(
	    	$rootScope, $stateParams, $state,
	    	$modal, $window, $scope, $http, $location,
	    	$modalInstance, item , customerResource, CartService) {
    	$scope.item = item;
    	//console.log(item);
    	$scope.verificationSection = false;
    	$scope.phoneSection = true;

		$scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.ok = function(customerPhone , customerId , vrCode) {
            var params = {};
            params.id 		= customerId;
            params.phone 	= customerPhone;
            params.vrcode 	= vrCode;
            customerResource.save({
        		method : 'change-customer-phone',
        		params : params
        	},function(response){
        		if (response.error) {
                    window.toastr.error(response.error.message);
                } else {
                    $scope.cancel();
                    window.toastr.success(response.result);
                    CartService.updatePhoneOnChange(customerPhone);
                }
        	});
        };

        $scope.showVerificationSection = function(customerId) {
        	$scope.phoneSection = false;
        	$scope.verificationSection = true;
        	customerResource.save({
        		method : 'send-verification-code',
        		params : {id : customerId}
        	},function(response){
        		if (response.error) {
                    window.toastr.error(response.error.message);
                } else {
                	 window.toastr.success(response.result);
                }
        	});
        };


	}]);

})();


(function() {
    'use strict';
    angular.module('FoodjetsApp').controller('changeAddressController', [
    	'$rootScope',
	    '$stateParams',
	    '$state',
	    '$modal',
	    '$window',
	    '$scope',
	    '$http',
	    '$location',
	    '$modalInstance',
	    'info',
	    'customerResource',
	    'CartService',
        'Fmoment',
	    function(
	    	$rootScope, $stateParams, $state,
	    	$modal, $window, $scope, $http, $location,
	    	$modalInstance, info , customerResource, CartService, Fmoment) {
            //console.log(info);
    	$scope.info = info;
    	$scope.ifAddressBoxFocused = false;
    	$scope.verificationSection = false;
    	$scope.phoneSection = true;
    	$scope.checkProperAddress = true;
    	$scope.zoneInfo = '';

    	// @flair
        $scope.customerInfo = {
            tmp_delivery_address: {},
            delivery_addresses: []
        };

		$scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.ok = function(customerAddress) {
            //var params = {};
            var params = {
                state_code: $scope.zoneInfo.state_code,
                market_office_city_delivery_zone_id: $scope.zoneInfo.zone_id,
                latitude: $scope.zoneInfo.latitude,
                longitude: $scope.zoneInfo.longitude,
                customer_id: info.id,
                address: customerAddress
            };
            //console.log(params);
            customerResource.save({
        		method : 'change-customer-address',
        		params : params
        	},function(response){
        		if (response.error) {
                    window.toastr.error(response.error.message);
                } else {
                    $scope.cancel();
                    window.toastr.success(response.result);
                    CartService.updateAddressOnChange(customerAddress , $scope.zoneInfo.zipcode);
                }
        	});
        };

        $scope.showDeliveryAddresses = function() {
                $scope.ifAddressBoxFocused = true;
        };

        $scope.hideDeliveryAddresses = function() {
            $scope.ifAddressBoxFocused = false;
        };

        $scope.clearCustomerAddress = function() {
            $scope.customerAddress = '';
            $scope.showOnProperAddressValidation = false;
        };

        // Populate Address In The Box For Saved Address
        $scope.populateAddressInTheBox = function(address) {
            $scope.ifAddressBoxFocused = false;
            $scope.customerAddress = address.address;
            var cartData = CartService.retrive(); // Fetching full cart data
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
                    delete address.market_office_city_delivery_zone_id;
                    //$scope.getAllRestaurants(angular.merge(address, response.result));
                    if(response.result.state_code !==cartData.delivery_address.state_code) {
                        window.toastr.error('State mismatched!! Please select address of same state to continue!!');
                    } else if(response.result.zone_id !== cartData.delivery_address.zone_id) {
                        window.toastr.error('Zone mismatched!! Please select address of same zone to continue!!');
                    } else {
                        $scope.checkProperAddress = false;
                    }
                }
            });

        };

        $scope.getCustomerAddress = function() {
        	customerResource.get({
                method: 'delivery-addresses',
                id: info.id
            }, function(response) {
                if (response.error) {
                    window.toastr.error(response.error.message, {});
                } else {
                    $scope.customerInfo.delivery_addresses = response.result[1];
                }
            });
        };

        // Hadle emit event on new address selection
        $scope.$on('zone-info', function(event, zoneInfo) {
            if (_.isEmpty(zoneInfo)) {
                return false;
            }
            var cartData = CartService.retrive(); // Fetching full cart data
            $scope.zoneInfo = zoneInfo;
            $scope.zoneInfo.zone_id = String($scope.zoneInfo.zone_id); // Number to string conversion

            console.log($scope.zoneInfo);

            if(_.isEmpty(cartData)) {
                window.toastr.error('Cart data is missing!!!');
            } else {
                if($scope.zoneInfo.state_code !==cartData.delivery_address.state_code) {
                    window.toastr.error('State mismatched!! Please select address of same state to continue!!');
                } else if($scope.zoneInfo.zone_id !== cartData.delivery_address.zone_id) {
                    window.toastr.error('Zone mismatched!! Please select address of same zone to continue!!');
                } else {
                    $scope.checkProperAddress = false;
                }
            }
        });

        $scope.init = function() {
            $scope.getCustomerAddress();
        };

        $scope.init();

	}]);

})();



(function() {
    'use strict';
    angular.module('FoodjetsApp').controller('addCardController', [
        '$rootScope',
        '$stateParams',
        '$state',
        '$modal',
        '$window',
        '$scope',
        '$http',
        '$location',
        '$modalInstance',
        'info',
        'customerResource',
        'CartService',
        'cardService',
        function(
            $rootScope, $stateParams, $state,
            $modal, $window, $scope, $http, $location,
            $modalInstance, info , customerResource, CartService, cardService) {
            $scope.info = info;

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            $scope.ok = function(customerAddress) {
                //var params = {};
                var params = {
                    state_code: $scope.zoneInfo.state_code,
                    market_office_city_delivery_zone_id: $scope.zoneInfo.zone_id,
                    latitude: $scope.zoneInfo.latitude,
                    longitude: $scope.zoneInfo.longitude,
                    customer_id: info.id,
                    address: customerAddress
                };
                //console.log(params);
                customerResource.save({
                    method : 'change-customer-address',
                    params : params
                },function(response){
                    if (response.error) {
                        window.toastr.error(response.error.message);
                    } else {
                        $scope.cancel();
                        window.toastr.success(response.result);
                        CartService.updateAddressOnChange(customerAddress);
                    }
                });
            };

            $scope.addCardDetails = function() {
                //console.log($scope.params);
                var card = $scope.params.card_number;
                var cvv = $scope.params.card_cvv;
                var y = $scope.params.expiry_year;
                var month = $scope.params.expiry_month.replace(/^\s+|\s+$/g, '');
                var year = y.replace(/^\s+|\s+$/g, '');
                $scope.params.cardUsed = false;
                $scope.params.cardUseType  = 'Personal';

                // Create a new `HPS` object with the necessary configuration
                (new window.Heartland.HPS({
                    publicKey: 'pkapi_cert_QFRtBq6l2t8cMhEbkM',
                    cardNumber: card.replace(/\D/g, ''),
                    cardCvv: cvv.replace(/\D/g, ''),
                    cardExpMonth: month.replace(/\D/g, ''),
                    cardExpYear: year.replace(/\D/g, ''),
                    // Callback when a token is received from the service
                    success: function(resp) {
                        console.log(resp);
                        //var is_default;

                        /*if ($scope.params.cardUsed === '') {
                            is_default = true;
                        } else {
                            is_default = $scope.params.isDefault;
                        }*/

                        //var xsrf = { device: { platform: "website" }, "card_number": $scope.params.cardNumber.slice(-4), "expiry_month": $scope.params.expMonth, "expiry_year": year, "zip": $scope.params.zip, "type": $scope.params.cardUseType, "hartland_token": resp.token_value, "is_default": is_default.toString() };

                        var cardData = {};
                        cardData.id = info.id;
                        cardData.card_number = $scope.params.card_number.slice(-4);
                        cardData.expiry_month = $scope.params.expiry_month;
                        cardData.expiry_year = year;
                        cardData.zip = $scope.params.zip;
                        cardData.type = $scope.params.cardUseType;
                        cardData.hartland_token = resp.token_value;
                        cardData.is_default = $scope.params.cardUsed.toString();

                        customerResource.save({
                            method : 'credit-card-add',
                            params : cardData
                        },function(response){
                            if (response.error) {
                                window.toastr.error(response.error.message);
                            } else {
                                cardService.addCardDetails(response.result);
                                $scope.cancel();
                                window.toastr.success('Card successfully added.');
                            }
                        });
                    },
                    // Callback when an error is received from the service
                    error: function(resp) {
                            $scope.resetCardObj(); //Card details
                            $scope.unblock("#add-credit-card", null);
                            $scope.toastrError(resp.error.message, {});
                        }
                        // Immediately call the tokenize method to get a token
                })).tokenize();



            };

            $scope.init = function() {

            };

            $scope.init();

    }]);

})();









(function(){
    'use strict';

    angular.module('FoodjetsApp')
    .factory('cardService' , ['$sessionStorage' , function($sessionStorage){
        var cardDetails = {};
        return {
            retrieve : function() {
                return cardDetails;
            },
            addCardDetails : function(details) {
                cardDetails = details;
                //$sessionStorage.card_info = details;
            }
        }
    }]);
})();

