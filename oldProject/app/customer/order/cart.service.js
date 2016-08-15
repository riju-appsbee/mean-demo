(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('CartService', ['$sessionStorage', function($sessionStorage) {
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
                    c.amount.food_amount = total;
                    return c;
                },
                storeInStorage: function(c) {
                    $sessionStorage.cart = cart = c;
                },
                addDeliveryAddress: function(customerInfo) {
                    var c = cart;
                    c.delivery_address = customerInfo.tmp_delivery_address;
                    c.customer_id = customerInfo.id;
                    c.delivery_address.phone = customerInfo.phone;
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
                },
                updatePhoneOnChange : function(phone) {
                    var c = cart;
                    c.delivery_address.phone = phone;
                    this.storeInStorage(c);
                },
                updateAddressOnChange : function(address , zipcode) {
                    var c = cart;
                    c.delivery_address.address = address;
                    c.delivery_address.zipcode = zipcode;
                    this.storeInStorage(c);
                }

            };


        }]);

})();