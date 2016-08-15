(function() {
    'use strict';

    // phone number formating..
    angular.module('FoodjetsApp').directive('inputMask', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                elem.inputmask('mask', {
                    mask: '(999) 999-9999'
                });
            }
        };
    });

    //Used for searching menu for a given place
    angular.module('FoodjetsApp').directive('gplace', ['$cookies', '$location', '$timeout', '$rootScope', 'customerZoneResource', '$sessionStorage', function($cookies, $location, $timeout, $rootScope, customerZoneResource, $sessionStorage) {

        return {
            restrict: 'CE',
            //replace: true,
            template: '<fj-loader></fj-loader>',
            link: function($scope, elm, attrs) {

                // Geolocation (Google map)
                var geo = {};
                geo.fncount = 0;
                geo.timer = [];

                geo.init = function() {
                    geo.fncount++;
                    if (google != null && typeof google === 'object') {
                        angular.forEach(geo.timer, function(val, key) {
                            $timeout.cancel(val);
                        });
                        geo.autocomplete = new google.maps.places.Autocomplete(elm[0], {
                            types: ['geocode']
                        });
                        google.maps.event.addListener(geo.autocomplete, 'place_changed', geo.placeChanged);

                        // Disable on enter form submit
                        google.maps.event.addDomListener(elm[0], 'keydown', function(e) {
                            if (e.keyCode == 13) {
                                e.preventDefault();
                            }
                        });
                    } else {
                        if (geo.fncount <= 3)
                            geo.timer.push($timeout(function() {
                                geo.init();
                            }, 500));
                    }
                };


                geo.placeChanged = function() {
                    $sessionStorage.tmpdz = {}; // cleanup session sessionStorage

                    var place = geo.autocomplete.getPlace();
                    if (place.geometry !== undefined) {

                        var location = [place.geometry.location.lat(), place.geometry.location.lng()];
                        var formatted_address = place.formatted_address;


                        var matchExp = /(\d+) (.+?), (.+?), (.+?) ([0-9]{5})/g;
                        if (matchExp.test(formatted_address || '')) {
                            formatted_address = formatted_address.match(/(\d+) (.+?), (.+?), (.+?) ([0-9]{5})/);
                            geo.getPolygons(location, formatted_address);
                        } else {
                            window.toastr.error('Incorrect address format.', {});
                        }
                    }

                };

                geo.existInPolygon = function(point, vs) {
                    // ray-casting algorithm based on
                    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
                    var x = point[0],
                        y = point[1];
                    var inside = false;
                    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                        var xi = vs[i].lat,
                            yi = vs[i].lng;
                        var xj = vs[j].lat,
                            yj = vs[j].lng;
                        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                        if (intersect)
                            inside = !inside;
                    }
                    return inside;
                };

                geo.getPolygons = function(location, addComponent) {

                    customerZoneResource.getDeliveryZones({
                        'method': 'get-delivery-zones',
                        'params': {
                            state: addComponent[4],
                            city: addComponent[3],
                            latlng: ''
                        }
                    }).then(function(resp) {
                        if (!!resp.result && resp.result.length > 0) {
                            var polygon = resp.result;
                            var zoneInfo = {};
                            polygon.forEach(function(k, ky) {
                                if (k.selected_area.length > 0) {
                                    var exist = geo.existInPolygon(location, k.selected_area);
                                    if (exist === true) {
                                        zoneInfo.zone_id = k.id;
                                        zoneInfo.market_office_city_id = k.market_office_city_id;
                                        zoneInfo.market_office_id = k.market_office_id;
                                        zoneInfo.timezone = k.timezone;
                                        zoneInfo.is_open = k.is_open;
                                        zoneInfo.max_dist_srt = k.max_dist_srt;
                                        zoneInfo.FOODJETS_CAR_SPEED = k.FOODJETS_CAR_SPEED;
                                        zoneInfo.RESTAURANTS_BUFFER_TIME = k.RESTAURANTS_BUFFER_TIME;
                                        zoneInfo.latitude = location[0];
                                        zoneInfo.longitude = location[1];
                                        zoneInfo.state_code = addComponent[4];
                                        zoneInfo.address = addComponent[0];
                                        zoneInfo.zipcode = addComponent[5];
                                    }
                                }
                            });

                            if (!_.isEmpty(zoneInfo)) {
                                // $sessionStorage.tmpdz = zoneInfo;
                                $scope.$emit('zone-info', zoneInfo);
                            } else {
                                window.toastr.error('Sorry your delivery location is outside our current delivery area. Please enter a different location.', {});
                            }

                        } else {
                            window.toastr.error(resp.error, {});
                        }

                    });

                };

                geo.init();
            }
        };
    }]);
})();
