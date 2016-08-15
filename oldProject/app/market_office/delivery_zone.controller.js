(function() {
    'use strict';

    angular.module('FoodjetsApp').controller('DeliveryZoneController', ['$rootScope', '$scope', '$stateParams', '$state', '$location', '$window', 'zoneService',
        function($rootScope, $scope, $stateParams, $state, $location, $window, zoneService) {

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.mcenter = {
                lat: 37.774546,
                lng: -122.433523
            };

            // Default values set for state
            $scope.states = [{
                id: 'CA',
                value: 'California'
            }, {
                id: 'AZ',
                value: 'Arizona'
            }];

            //Error
            $scope.errors = {
                status: false,
                msg: ''
            };

            // params object initialized for form input value store
            $scope.params = {};

            // days object initialized
            $scope.days = [{
                'key': 'mon',
                'value': 'Monday'
            }, {
                'key': 'tue',
                'value': 'Tuesday'
            }, {
                'key': 'wed',
                'value': 'Wednesday'
            }, {
                'key': 'thu',
                'value': 'Thursday'
            }, {
                'key': 'fri',
                'value': 'Friday'
            }, {
                'key': 'sat',
                'value': 'Saturday'
            }, {
                'key': 'sun',
                'value': 'Sunday'
            }];

            $scope.shifts = [{
                'key' : 'shift 1',
                'value' : 1
            },{
                'key' : 'shift 2',
                'value' : 2
            },{
                'key' : 'shift 3',
                'value' : 3
            }];
            // moment(new Date($scope.opening_hours[k][k1].start_time).toISOString()).unix()
            // var currentD = new Date().toString();
            var currentD = new Date().toISOString();
            $scope.start_time = moment(currentD).utc().format('YYYY-MM-DD HH:mm:ss');
            $scope.end_time = moment(currentD).utc().format('YYYY-MM-DD HH:mm:ss');

            //########## hour and minute steps declaration
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


            $scope.format = {
                toHrMin: function(dateString) {
                    var myDate = new Date(dateString);
                    return myDate.getHours() + ':' + (myDate.getMinutes()<10?'0':'') + myDate.getMinutes() ;
                },
                toDt: function(hrmin) {
                    hrmin = hrmin.split(':');
                    var d = new Date();
                    d.setHours(parseInt(hrmin[0]), parseInt(hrmin[1]));
                    return d;
                }
            };







            // lat and lng of all points of selected area object initialize
            $scope.selectedArea = [];

            // for listing page result object initialize
            $scope.listOfDeliveryZones = [];

            //from url query string
            $scope.selectedState = $stateParams.state;
            $scope.mofId = $stateParams.mofid;
            $scope.cityId = $stateParams.cityid;

            // Count total delivery zones
            $scope.deliveryZoneCount = function() {

                zoneService.get({
                    method: 'count',
                    state: $scope.selectedState,
                    mofid: $scope.mofId,
                    cityid: $scope.cityId
                }, function(response) {
                    console.log(response);
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.totalItems = response.result.count;
                        $scope.numPerPage = response.result.numPerPage;

                        $scope.deliveryZoneList();
                    }
                });
            };

            //get delivery zone listing
            $scope.deliveryZoneList = function() {
                $scope.loderValue = true;
                zoneService.get({
                    'method': 'list',
                    'p': $scope.currentPage,
                    'state': $scope.selectedState,
                    'mofid': $scope.mofId,
                    'cityid': $scope.cityId
                }, function(response) {

                    if (response.error) {
                        $scope.errors.msg = response.error.message;
                        $scope.errors.status = true;
                    } else {
                        $scope.listOfDeliveryZones = response.result;
                        $scope.loderValue = false;
                    }
                });
            };

            // Getting lat and lng of selected area from map
            $scope.onMapOverlayCompleted = function(e) {
                var vertices = e.overlay.getPaths().getArray();

                if (vertices.length <= 0) {
                    alert('Polygon vertices does not exist.');
                    return false;
                }

                var locObj = [];
                // Iterate over the vertices.
                for (var i = 0; i < vertices[0].getLength(); i++) {
                    var xy = vertices[0].getAt(i);
                    locObj.push({
                        lat: xy.lat(),
                        lng: xy.lng()
                    });
                }
                $scope.selectedArea = locObj;
            };

            // add delivery zone function
            $scope.addDeliveryZone = function(params) {
                params.selected_area = JSON.stringify($scope.selectedArea);
                zoneService.save({
                    'method': 'add',
                    'state': $stateParams.state,
                    'mofid': $stateParams.mofid,
                    'cityid': $stateParams.cityid,
                    params: params
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.result.message, {});
                        $location.path('/ng/market-office-city/edit/' + $stateParams.state + '/' + $stateParams.mofid + '/' + $stateParams.cityid);
                    }
                });
            };

            // delete delivery zone function
            $scope.deleteDeliveryZone = function(zoneId) {
                if ($window.confirm('Do you really want to delete this delivery zone?')) {
                    zoneService.delete({
                        method: 'delete',
                        'state': $stateParams.state,
                        'mofid': $stateParams.mofid,
                        'cityid': $stateParams.cityid,
                        id: zoneId
                    }, function(response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            $scope.toastrSuccess(response.result.message, {});
                            $scope.deliveryZoneList();
                        }
                    });
                }
            };
            // Zoom into the city while adding/editing a delivery zone
            $scope.getCityInfo = function() {
                // console.log($stateParams.cityid);
                zoneService.get({
                    method: 'fetch-city-details',
                    state: $stateParams.state,
                    'cityid': $stateParams.cityid
                }, function(response) {
                    // console.log(response);
                    if (response.error) {
                        conmsole.log(response.error);
                        $scope.toastrError(response.error.message, {});
                    } else {
                        var cityName = response.result.city_name;
                        // console.log(cityName);return;
                        var geocoder = new google.maps.Geocoder();
                        geocoder.geocode({ 'address': cityName + ', us' }, function(results, status) {
                            if (status == google.maps.GeocoderStatus.OK) {
                                // console.log("location : " + results[0].geometry.location.lat() + " " + results[0].geometry.location.lng());
                                $scope.mcenter = {
                                    lat: results[0].geometry.location.lat(),
                                    lng: results[0].geometry.location.lng()
                                };
                                if (!$scope.$$phase) $scope.$apply();
                            } else {
                                console.log("Could not fetch lat-long of the city..." + status);
                                $scope.toastrError("Could not fetch lat-long of the city..." + status, {});
                            }
                        });


                    }
                });
            };
            //Get market office information by id
            $scope.getDeliveryZoneInfo = function() {
                var id = $stateParams.id;
                var selArea = [];
                zoneService.get({
                    method: 'info',
                    'state': $stateParams.state,
                    'mofid': $stateParams.mofid,
                    'cityid': $stateParams.cityid,
                    id: id
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                        $location.path(
                            '/ng/delivery-zone/list/' + $stateParams.state + '/' + $stateParams.mofid + '/' +
                            $stateParams.cityid);
                    } else {
                        $scope.params.delivery_zone_name = response.result.delivery_zone_name;
                        $scope.params.onfleet_id = response.result.onfleet_id;
                        //$scope.params.selected_area = response.result.selected_area;
                        $scope.params.is_active = (response.result.is_active === 'true') ? 'true' : 'false';
                        $scope.params.pause_delivery_zone = (response.result.pause_delivery_zone === 'true') ?
                            'true' : 'false';
                        $scope.params.custom_message = response.result.custom_message;
                        $scope.params.max_dist_srt = (response.result.max_dist_srt===undefined || response.result.max_dist_srt==='' || response.result.max_dist_srt===null || response.result.max_dist_srt==0)?'':response.result.max_dist_srt;

                        //######### Drawn polygon display over map in edit page starts #############
                        if (response.result.selected_area !== undefined) {
                            var selectedArea = JSON.parse(response.result.selected_area);
                            $scope.params.selected_area = response.result.selected_area;
                            if (selectedArea.length > 0) {
                                angular.forEach(selectedArea, function(value, key) {
                                    var temp = [
                                        value.lat, value.lng
                                    ];
                                    selArea.push(temp);
                                });

                                // Get center of polygon
                                var bounds = new google.maps.LatLngBounds();
                                for (var i = 0; i < selArea.length; i++) {
                                    bounds.extend(new google.maps.LatLng(selArea[i][0], selArea[i][1]));
                                }
                                var center = bounds.getCenter();
                                $scope.mcenter = {
                                    lat: center.lat(),
                                    lng: center.lng()
                                };
                            }
                        }
                        $scope.drawnPolygon = selArea;
                        // if (!$scope.$$phase) $scope.$apply();
                        //######### Drawn polygon display over map in edit page enmds #############



                    }
                });

                
                //########### initializing tempData object
                $scope.tempData = $scope.tempData || {};
                
                //########### initializing all day , start_time and end_time
                angular.forEach($scope.days, function(value, key) {
                    angular.forEach($scope.shifts, function(valueS , keyS) {
                        // console.log($scope.start_time);
                        $scope.tempData['start_time_' + value.key+'_'+valueS.value] = moment($scope.start_time,'YYYY-MM-DD HH:mm:ss').unix();
                        $scope.tempData['end_time_' + value.key+'_'+valueS.value] = moment($scope.end_time,'YYYY-MM-DD HH:mm:ss').unix();
                        $scope.tempData['is_open_' + value.key+'_'+valueS.value] = 'false';
                    });
                });
                
                //########### Fetching data for operation hour
                zoneService.get({
                    method: 'hour_info',
                    'state': $stateParams.state,
                    'mofid': $stateParams.mofid,
                    'cityid': $stateParams.cityid,
                    id: id
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                        $location.path(
                            '/ng/delivery-zone/list/' + $stateParams.state + '/' + $stateParams.mofid + '/' +
                            $stateParams.cityid);
                    } else {
                        
                        angular.forEach(response.result, function(value, key) {
                        
                            $scope.tempData['start_time_' + value.day+'_'+value.shift] = value.start_time ? $scope.format.toDt(value.start_time) : $scope.start_time;
                            $scope.tempData['end_time_' + value.day+'_'+value.shift] = value.end_time ?$scope.format.toDt(value.end_time) : $scope.end_time;
                            $scope.tempData['is_open_' + value.day+'_'+value.shift] = (value.is_open === 'true') ? 'true' : 'false';


                        });

                        console.log($scope.tempData);
                        
                    }
                });
                

                
                
            };

            // edit delivery zone function
            $scope.editDeliveryZone = function(params) {
                if ($scope.selectedArea.length > 0) {
                    params.selected_area = JSON.stringify($scope.selectedArea);
                } else {
                    params.selected_area = $scope.params.selected_area;
                }
                $scope.params.id = $stateParams.id;
                zoneService.save({
                    'method': 'update',
                    'state': $stateParams.state,
                    'mofid': $stateParams.mofid,
                    'cityid': $stateParams.cityid,
                    params: params
                }, function(response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                        $scope.toastrSuccess(response.result.message, {});
                        $location.path('/ng/market-office-city/edit/' + $stateParams.state + '/' + $stateParams.mofid + '/' + $stateParams.cityid);
                    }
                });
            };

            // saving operational hour data from edit delivery zone page
            $scope.saveOperationalHours = function(hourData) {
                //console.log(hourData);
                var op_hour = {};
                //## Creating op_hour object depending on user hour inputs after submit from zone page
                angular.forEach($scope.days, function(value, key) {
                    op_hour[key] = op_hour[key] || {};
                    angular.forEach($scope.shifts, function(valueS , keyS) {
                        //console.log(valueS.value);
                        op_hour[key][valueS.value] = op_hour[key][valueS.value] || {};
                        /*op_hour[key][valueS.value] = op_hour[key][valueS.value] || {};
                        op_hour[key][valueS.value].start_time = '';
                        op_hour[key][valueS.value].end_time = '';*/
                        if (hourData) {
                            op_hour[key][valueS.value].is_open = hourData['is_open_' + value.key+'_'+valueS.value];
                            op_hour[key][valueS.value].day = value.key;
                            op_hour[key][valueS.value].market_office_city_delivery_zone_id = $stateParams.id;
                            var startValue = hourData['start_time_' + value.key+'_'+valueS.value];
                            var endValue = hourData['end_time_' + value.key+'_'+valueS.value];
                            var nextS = hourData['start_time_' + value.key+'_'+(parseInt(valueS.value)+1)];

                            //console.log('This End:',endValue,'Next Start:',nextS);

                            var st_time = moment(new Date(startValue).toISOString()).unix();
                            var ed_time = moment(new Date(endValue).toISOString()).unix();

                            if(st_time !== '' && ed_time!== '') {
                                if(ed_time <= st_time) {
                                    $scope.toastrError('Start time of shift '+valueS.value+' of '+value.key+' should be less than end time ', {});
                                } else if(valueS.value === 1 && ed_time >= moment(new Date(hourData['start_time_' + value.key+'_'+(parseInt(valueS.value)+1)]).toISOString()).unix()) {
                                    
                                    $scope.toastrError('Start time of shift '+(parseInt(valueS.value)+1)+' of '+value.key+' should be greater than previous end time ', {});

                                } else if(valueS.value === 2 && ed_time >= moment(new Date(hourData['start_time_' + value.key+'_'+(parseInt(valueS.value)+1)]).toISOString()).unix()) {
                                    
                                    $scope.toastrError('Start time of shift '+(parseInt(valueS.value)+1)+' of '+value.key+' should be greater than previous end time ', {});

                                } else {
                                    op_hour[key][valueS.value].start_time = $scope.format.toHrMin(hourData['start_time_' + value.key+'_'+valueS.value]);

                                    op_hour[key][valueS.value].end_time = $scope.format.toHrMin(hourData['end_time_' + value.key+'_'+valueS.value]);

                                    //## Assigning value of id into params object
                                    $scope.params.id = $stateParams.id;

                                    //## For loop which calls update_hours api for all keys ([0-6] = 7 keys) of op_hour object
                                    if (!$scope.isEmpty(op_hour)) {
                                        angular.forEach(op_hour, function(value, key) {
                                            angular.forEach(value, function(value1, key1) {
                                                var params = {};
                                                params.start_time = value1.start_time || 'NULL';
                                                params.end_time = value1.end_time || 'NULL';
                                                params.day = value1.day;
                                                params.is_open = value1.is_open;
                                                params.market_office_city_delivery_zone_id = value1.market_office_city_delivery_zone_id;
                                                params.shift = key1;
                                                
                                                zoneService.save({
                                                    'method': 'update_hours',
                                                    'state': $stateParams.state,
                                                    'mofid': $stateParams.mofid,
                                                    'cityid': $stateParams.cityid,
                                                    params: params
                                                }, function(response) {
                                                    if (response.error) {
                                                        $scope.toastrError(response.error.message, {});
                                                    } else {
                                                        $scope.toastrSuccess(response.result, {});
                                                        $location.path(
                                                            '/ng/delivery-zone/edit/' + $stateParams.state + '/' +
                                                            $stateParams.mofid + '/' + $stateParams.cityid + '/' + $stateParams.id);
                                                    }
                                                });
                                            });
                                        });
                                    } else {
                                        $scope.toastrError('Please enter proper time before save', {});
                                    }
                                }
                            }
                        } else {
                            $scope.toastrError('Start time or End time is blank ', {});
                        }

                           /* if (hourData['start_time_' + value.key+'_'+valueS.value] !== '' && hourData['end_time_' + value.key+'_'+valueS.value] !== '') {
                                if (moment(new Date(hourData['end_time_' + value.key+'_'+valueS.value]).toISOString()).unix() !== '00:00:00' &&
                                    moment(new Date(hourData['start_time_' + value.key+'_'+valueS.value]).toISOString()).unix() !== '00:00:00' &&
                                    moment(new Date(hourData['end_time_' + value.key+'_'+valueS.value]).toISOString()).unix() <= moment(new Date(hourData['start_time_' + value.key+'_'+valueS.value]).toISOString()).unix()) {
                                    $scope.toastrError('End time should be greater than start time', {});
                                    op_hour = {};
                                } else {*/
                                    /*op_hour[key][valueS.value].start_time = moment(hourData['start_time_' + value.key+'_'+valueS.value]).format('YYYY-MM-DD HH:mm:ss') ;
                                    op_hour[key][valueS.value].end_time = moment(hourData['end_time_' + value.key+'_'+valueS.value]).format('YYYY-MM-DD HH:mm:ss');*/

                                    
                                //}

                            //}
                        //}
                    });                   
                });

                //console.log(op_hour);

                
            };

            // function checking an object is empty or not
            $scope.isEmpty = function(object) {
                for (var key in object) {
                    if (object.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            };

            // initiating below functions on page load
            $scope.init = function() {
                //calling urls based on state
                var stateInit = {
                    'ng.delivery-zone.list': function() {
                        $scope.deliveryZoneCount();
                    },
                    'ng.delivery-zone.add': function() {
                        $scope.getCityInfo();

                    },
                    'ng.delivery-zone.edit': function() {
                        $scope.getCityInfo();
                        $scope.getDeliveryZoneInfo();
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
