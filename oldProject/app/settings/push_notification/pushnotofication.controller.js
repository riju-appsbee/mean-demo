(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('PushNotificationController', 
    ['$rootScope',
        '$stateParams',
        '$state', '$scope',
        '$location',
        'pushNotificationResource',
        'Globalutc',       
        function ($rootScope, $stateParams, $state, $scope, $location, pushNotificationResource, Globalutc) {
            
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            
            
            
            $scope.showPushNotificationSettings = function() {
                $scope.params = {};
                pushNotificationResource.get({'jsonrpc': '2.0', 'method': 'fetch'},
                    function (response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            if(response.result) {
                                Object.keys(response.result).forEach(function(k, v) {
                                    if(response.result[v].name === 'GCM_URL'){
                                        $scope.params['GCM_URL'] = response.result[v].value;
                                    }
                                    if(response.result[v].name === 'GCM_API_KEY'){
                                        $scope.params['GCM_API_KEY'] = response.result[v].value;
                                    }
                                    if(response.result[v].name === 'APNS_URL'){
                                        $scope.params['APNS_URL'] = response.result[v].value;
                                    }
                                    if(response.result[v].name === 'APNS_CERT'){
                                        $scope.params['APNS_CERT'] = response.result[v].value;
                                    }
                                    if(response.result[v].name === 'APNS_PASSPHRASE'){
                                        $scope.params['APNS_PASSPHRASE'] = response.result[v].value;
                                    }
                                    
                                });
                            }
                        }
                });
                
            };

            $scope.savePushNotificationSettings = function(params) {
                if(params) {
                    Object.keys(params).forEach(function(k, v) {
                        var temp = {
                            'name' : k,
                            'value': params[k],
                            'description': '',
                            'settings_type':'PNS'
                        };
                        pushNotificationResource.save({'jsonrpc': '2.0', 'method': 'add', 'params': temp},
                        function (response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } 
                        });
                    });
                    $scope.toastrSuccess('Push Notification settings successfully saved!!' , {});
                }
                
            };

            $scope.init = function () {                
                //calling list if list page is called
                var stateInit = {
                    'ng.settings.push-notification-setting': function () {                        
                        $scope.showPushNotificationSettings();
                    }
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


