(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('OrderService', ['$resource',
            function($resource) {

                return $resource('/api/market-store/:method/:id', {
                    method: '@method',
                    id: '@id'
                }, {
                    send: {
                        method: 'POST'
                    }
                });
            }
        ]);
})();


(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('RestaurantListing', ['GeoDistance', 'Fmoment',
            function(GeoDistance, Fmoment) {

                var Algo = function(restaurants, address) {
                    this.setRestaurants(restaurants);
                    this.setCarSpeed(address.FOODJETS_CAR_SPEED);
                    this.setBufferTime(address.RESTAURANTS_BUFFER_TIME);
                    this.setCustomerLocation([parseFloat(address.latitude), parseFloat(address.longitude)]);
                    this.setIsOpen(address.is_open);
                    this.maxDistSrt(address.max_dist_srt);
                };

                Algo.prototype.setRestaurants = function(restaurants) {
                    if (!!restaurants) this._a = restaurants;
                    else throw ('Restaurants info required.');
                };

                Algo.prototype.setCarSpeed = function(car_speed) {
                    if (!!car_speed) this._b = parseInt(car_speed);
                    else throw ('Car speed required.');
                };

                Algo.prototype.setBufferTime = function(buffer_time) {
                    if (!!buffer_time) this._c = parseFloat(buffer_time);
                    else throw ('Buffer time required.');
                };

                Algo.prototype.setCustomerLocation = function(customer_location) {
                    if (!!customer_location) this._d = customer_location;
                    else throw ('Customer location required.');
                };

                Algo.prototype.setIsOpen = function(open) {
                    if (open !== undefined) this._f = open;
                    else throw ('Zone `is_open` required.');
                };

                Algo.prototype.maxDistSrt = function(max_dist_srt) {
                    if (!!max_dist_srt) this._g = max_dist_srt;
                    else throw (' `max_dist_srt` required.');
                };

                // Algo.prototype.sortByOrderTime = function() {
                //
                //     var filtered = [];
                //     _.each(this._e, function(item, key) {
                //         item._id = key;
                //         filtered.push(item);
                //     });
                //
                //     filtered.sort(function(a, b) {
                //         return (a['order_time'] > b['order_time'] ? 1 : -1);
                //     });
                //
                //     var filterData = _.reduce(filtered, function(o, v) {
                //         o[v._id] = v;
                //         o[v._id].cuisine = v.cuisine_tag.join(' , ');
                //         delete o[v._id]._id;
                //         return o;
                //     }, {});
                //     // console.log(filterData);
                //     return filterData;
                // };

                Algo.prototype.sortByDistance = function() {
                    var vm = this;
                    var day = Fmoment.today(); // make sure timezone already setup
                    var filtered = [];
                    _.each(this._e, function(item, key) {
                        if (item.distance <= vm._g) {
                            item.opening_hours = item.opening_hours && (day in item.opening_hours) ? item.opening_hours[day] : {};
                            item.is_open = Fmoment.isOpen(item.opening_hours);
                            item.is_closed = item.is_open !== null && vm._f === 'true' ? false : true;
                            item.cuisine = item.cuisine_tag.join(' , ');
                            item._id = key;
                            filtered.push(item);
                        }
                    });

                    filtered.sort(function(a, b) {
                        return (a['distance'] > b['distance'] ? 1 : -1);
                    });

                    var filterData = _.reduce(filtered, function(o, v) {
                        o[v._id] = v;
                        delete o[v._id]._id;
                        return o;
                    }, {});

                    // console.log(filterData);
                    return filterData;
                };

                Algo.prototype.mapReduce = function() {
                    var vm = this;
                    this._e = _.reduce(this._a, function(o, v, k) {
                        if (v.active === true && v.location !== undefined && v.location.lat !== undefined && v.location.lng !== undefined && !!v.rest_avg_prep_time && !!v.location.lat && !!v.location.lng) {
                            v.distance = GeoDistance._time([v.location.lat, v.location.lng], vm._d, vm._b);
                            v.order_time = Math.ceil(v.distance) + parseInt(v.rest_avg_prep_time) + vm._c;
                            o[k] = v;
                        }
                        return o;
                    }, {});

                    return this.sortByDistance();

                };

                return Algo;

            }
        ]);

})();



(function() {
    'use strict';

    angular.module('FoodjetsApp')
        .factory('GeoDistance', ['math',
            function(math) {

                var geo = {};

                geo.degreesToRadians = function(degrees) {
                    if (typeof degrees !== 'number' || isNaN(degrees)) {
                        throw new Error('Error: degrees must be a number');
                    }

                    return (degrees * Math.PI / 180);
                };

                geo.validateLocation = function(location) {
                    var error;

                    if (!Array.isArray(location)) {
                        error = 'location must be an array';
                    } else if (location.length !== 2) {
                        error = 'expected array of length 2, got length ' + location.length;
                    } else {
                        var latitude = location[0];
                        var longitude = location[1];

                        if (typeof latitude !== 'number' || isNaN(latitude)) {
                            error = 'latitude must be a number';
                        } else if (latitude < -90 || latitude > 90) {
                            error = 'latitude must be within the range [-90, 90]';
                        } else if (typeof longitude !== 'number' || isNaN(longitude)) {
                            error = 'longitude must be a number';
                        } else if (longitude < -180 || longitude > 180) {
                            error = 'longitude must be within the range [-180, 180]';
                        }
                    }

                    if (typeof error !== 'undefined') {
                        throw new Error('Invalid GeoFire location \'' + location + '\': ' + error);
                    }
                };

                geo.distance = function(location1, location2) {
                    var radius = 3960; // Earth's radius in Miles // 6371 will be for mile km
                    var latDelta = geo.degreesToRadians(location2[0] - location1[0]);
                    var lonDelta = geo.degreesToRadians(location2[1] - location1[1]);

                    var a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
                        (Math.cos(geo.degreesToRadians(location1[0])) * Math.cos(geo.degreesToRadians(location2[0])) *
                            Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));

                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                    return radius * c;
                };

                geo._time = function(location1, location2, car_speed) { // car_speed == mile per hour

                    if (typeof car_speed !== 'number' || isNaN(car_speed)) {
                        throw new Error('Error: degrees must be a number');
                    }

                    geo.validateLocation(location1);
                    geo.validateLocation(location2);

                    var distance = geo.distance(location1, location2); // in miles
                    distance = math.round(distance);
                    return math.round((distance * 60) / car_speed); // in minutes
                }

                return geo;

            }
        ]);

})();
