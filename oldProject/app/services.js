(function() {

    'use strict';


    angular.module('FoodjetsApp').factory('settings', ['$rootScope', function($rootScope) {
        // supported languages
        var settings = {
            layout: {
                pageSidebarClosed: false, // sidebar menu state
                pageContentWhite: true, // set page content layout
                pageBodySolid: false, // solid body color state
                pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
            },
            assetsPath: 'assets',
            globalPath: 'assets/global',
            layoutPath: 'assets/layouts/layout',
        };

        $rootScope.settings = settings;

        return settings;
    }]);


})();

(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('marketOffice', ['$q', 'marketOfficeResource',
        function($q, marketOfficeResource) {

            return {
                getAll: function(state, cb) {

                    var marketOffice = {};
                    marketOffice = marketOfficeResource.get({
                        'state': state
                    });

                    if (marketOffice.hasOwnProperty('$promise')) {
                        marketOffice.$promise.then(function(response) {

                            if (typeof response.result === 'object') {
                                cb(false, response.result);
                            } else {
                                cb(true, {});
                            }

                        }).catch(function() {
                            cb(true, {});
                        });
                    } else {
                        cb(true, {});
                    }
                }

            };
        }
    ]);



})();

(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('marketOfficeResource', ['$resource', function($resource) {
        return $resource('/api/market-office/list/:state', {
            state: '@state'
        }, {
            send: {
                method: 'POST'
            }
        });
    }]);


    angular.module('FoodjetsApp').factory('cityFactory', ['$q', 'StateCityResource',
        function($q, StateCityResource) {

            return {
                getAll: function(state, cb) {

                    var marketOffice = {};
                    marketOffice = StateCityResource.get({
                        'state': state
                    });

                    if (marketOffice.hasOwnProperty('$promise')) {
                        marketOffice.$promise.then(function(response) {

                            if (typeof response.result === 'object') {
                                cb(false, response.result);
                            } else {
                                cb(true, {});
                            }

                        }).catch(function() {
                            cb(true, {});
                        });
                    } else {
                        cb(true, {});
                    }
                }

            };
        }
    ]);

    angular.module('FoodjetsApp').factory('StateCityResource', ['$resource', function($resource) {
        return $resource('/api/market-office/Citylist/:state', {
            state: '@state'
        }, {
            send: {
                method: 'POST'
            }
        });
    }]);


})();


(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('deliveryZone', ['$q', 'deliveryZoneResource',
        function($q, deliveryZoneResource) {

            return {
                getAll: function(state, mofid, cb) {

                    var deliveryZone = {};
                    deliveryZone = deliveryZoneResource.get({
                        'state': state,
                        'mofid': mofid,
                    });

                    if (deliveryZone.hasOwnProperty('$promise')) {
                        deliveryZone.$promise.then(function(response) {

                            if (typeof response.result === 'object') {
                                cb(false, response.result);
                            } else {
                                cb(true, {});
                            }

                        }).catch(function() {
                            cb(true, {});
                        });
                    } else {
                        cb(true, {});
                    }
                }

            };
        }
    ]);



})();


(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('deliveryZoneResource', ['$resource', function($resource) {
        return $resource('/api/delivery-zone/all/:state/:mofid', {
            state: '@state',
            mofid: '@mofid'
        }, {
            send: {
                method: 'POST'
            }
        });
    }]);


})();



(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('marketOfficeCity', ['$q', 'marketOfficeCityResource',
        function($q, marketOfficeCityResource) {

            return {
                getAll: function(state, mofid, cb) {

                    var marketOfficeCity = {};
                    marketOfficeCity = marketOfficeCityResource.get({
                        'state': state,
                        'mofid': mofid
                    });

                    if (marketOfficeCity.hasOwnProperty('$promise')) {
                        marketOfficeCity.$promise.then(function(response) {

                            if (typeof response.result === 'object') {
                                cb(false, response.result);
                            } else {
                                cb(true, {});
                            }

                        }).catch(function() {
                            cb(true, {});
                        });
                    } else {
                        cb(true, {});
                    }
                }

            };
        }
    ]);



})();

(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('marketOfficeCityResource', ['$resource', function($resource) {
        return $resource('/api/market-office-city/all/:state/:mofid', {
            state: '@state',
            mofid: '@mofid'
        }, {
            send: {
                method: 'POST'
            }
        });
    }]);


})();


(function() {
    'use strict';


    angular.module('FoodjetsApp').factory('RTFoodJets', ['$cookies', function($cookies) {

        var fb = null;

        if (!!fb) {
            return fb;
        } else {
            var foodjets = $cookies.get('foodjets');
            foodjets = angular.fromJson(foodjets) || {};

            if (foodjets.ftkn !== undefined && !!foodjets.ftkn) {
                // Initialize Firebase
                // var config = {
                //     apiKey: "AIzaSyDBlaImjvsAFaZ04WuK3uIqR6lVuoeDDu8",
                //     authDomain: "foodjets.firebaseapp.com",
                //     databaseURL: "https://foodjets.firebaseio.com",
                //     storageBucket: "foodjets.appspot.com"
                // };
                // console.log(window.location.href);
                var fullPath = window.location.href;
                var config = {};
                if (fullPath.indexOf("localhost") != -1) {
                    config = {
                        apiKey: "AIzaSyCgPiPlsv-jZj5SNME6TK645XtGYHpzlic",
                        authDomain: "foodjets-dev-local.firebaseapp.com",
                        databaseURL: "https://foodjets-dev-local.firebaseio.com",
                        storageBucket: "foodjets-dev-local.appspot.com",
                    };
                } else {
                    config = {
                        apiKey: "AIzaSyBo2UVHKB2honDutQGN_tyYSsG4lZ5BMi4",
                        authDomain: "foodjets-dev.firebaseapp.com",
                        databaseURL: "https://foodjets-dev.firebaseio.com",
                        storageBucket: "foodjets-dev.appspot.com",
                    };

                }
                fb = firebase.initializeApp(config);

                fb.auth().signInWithCustomToken(foodjets.ftkn).catch(function(error) {
                    console.log(error.code, error.message);
                });

            }
            return fb;
        }

    }]);


})();



(function() {
    'use strict';

    angular.module('FoodjetsApp').factory('Globalutc', [function() {

        return {
            now: function() {
                return moment.utc().unix();
            }
        };

    }]);

})();


(function() {
    'use strict';

    angular.module('FoodjetsApp').factory('GlobalVar', [function() {

        return {
            states: function() { // fetch these vars from config setting
                return [{
                    id: 'CA',
                    value: 'California'
                }, {
                    id: 'AZ',
                    value: 'Arizona'
                }];
            }
        };

    }]);

})();



(function() {
    'use strict';

    angular.module('FoodjetsApp').factory('Fmoment', [function() {

        var m = {};
        m.setDTZ = function(tz) {
            moment.tz.setDefault(tz);
        };
        m.getDTZ = function() {
            return moment.tz.guess();
        }
        m.isOpen = function(hours) {
            var closed = null;
            _.each(hours, function(v, k) {
                var now = (moment().hours() * 60) + moment().minutes(),
                    start_time = (moment(v.start_time, 'HH:mm').hours() * 60) + moment(v.start_time, 'HH:mm').minutes(),
                    end_time = (moment(v.end_time, 'HH:mm').hours() * 60) + moment(v.end_time, 'HH:mm').minutes();

                if (start_time <= now && now <= end_time) {
                    closed = k;
                }
            });
            return closed;
        }
        m.unix = function() {
            return moment().unix();
        };

        m.today = function() {
            return moment().format('ddd').toLowerCase();
        };


        return m;

    }]);

})();



(function() {

    'use strict';
    angular.module('FoodjetsApp').factory('FbSearchService', ["$resource", function($resource) {
        return $resource('/api/query/search-path/', {
            q: '@q',
            path: '@path'
        }, {
            send: {
                method: 'GET'
            }
        });
    }]);

})();

// Math round
(function() {

    angular.module("FoodjetsApp").factory('math', [function() {

        return {
            round: function(num) {
                return +(Math.round(num + "e+2") + "e-2");
            }
        };

    }]);


})();
