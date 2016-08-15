(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('TwilioSettingsController', 
    ['$rootScope',
        '$stateParams',
        '$state', '$scope',
        '$location',
        'twilioSettingsResource',
        'Globalutc',       
        function ($rootScope, $stateParams, $state, $scope, $location, twilioSettingsResource, Globalutc) {
            
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            
            
            
            $scope.showTwilioSettings = function() {
                $scope.params = {};
                twilioSettingsResource.get({'jsonrpc': '2.0', 'method': 'fetch'},
                    function (response) {
                        if (response.error) {
                            $scope.toastrError(response.error.message, {});
                        } else {
                            Object.keys(response.result).forEach(function(k, v) {
                                if(response.result[v].name === 'TWILIO_ENVIRONMENT'){
                                    $scope.params['env'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_MSG_CALL_STATUS'){
                                    //#### spliting callmessage value to array
                                    var rs = numberSplit(response.result[v].value);
                                    
                                    //#### setting call Yes/No value
                                    if(rs[0] === 1) {
                                        $scope.params.call = 'true';
                                    } else {
                                        $scope.params.call = 'false';
                                    }

                                    //#### setting message Yes/No value
                                    if(rs[1] === 1) {
                                        $scope.params.message = 'true';
                                    } else {
                                        $scope.params.message = 'false';
                                    }
                                }

                                if(response.result[v].name === 'ACCESS_TOKEN_DEVELOPMENT'){
                                    $scope.params['ACCESS_TOKEN_DEVELOPMENT'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'ACCESS_TOKEN_PRODUCTION'){
                                    $scope.params['ACCESS_TOKEN_PRODUCTION'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'ACCOUNT_SID_DEVELOPMENT'){
                                    $scope.params['ACCOUNT_SID_DEVELOPMENT'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'ACCOUNT_SID_PRODUCTION'){
                                    $scope.params['ACCOUNT_SID_PRODUCTION'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'FROM_NUMBER_DEVELOPMENT'){
                                    $scope.params['FROM_NUMBER_DEVELOPMENT'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'FROM_NUMBER_PRODUCTION'){
                                    $scope.params['FROM_NUMBER_PRODUCTION'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_URL_DEVELOPMENT'){
                                    $scope.params['TWILIO_URL_DEVELOPMENT'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_URL_PRODUCTION'){
                                    $scope.params['TWILIO_URL_PRODUCTION'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_MESSAGE_AFTER_ORDER'){
                                    $scope.params['TWILIO_MESSAGE_AFTER_ORDER'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_MESSAGE'){
                                    $scope.params['TWILIO_MESSAGE'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_VERIFICATION_MESSAGE'){
                                    $scope.params['TWILIO_VERIFICATION_MESSAGE'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_DOWNLOAD_LINK'){
                                    $scope.params['TWILIO_DOWNLOAD_LINK'] = response.result[v].value;
                                }
                                if(response.result[v].name === 'TWILIO_LATE_MESSAGE'){
                                    $scope.params['TWILIO_LATE_MESSAGE'] = response.result[v].value;
                                }
                            });
                        }
                });
                
            };

            $scope.saveTwilioSettings = function(params) {
                if(params) {
                    params.TWILIO_MSG_CALL_STATUS = '';
                    params.TWILIO_ENVIRONMENT = params.env;
                    delete params.env;

                    if(params.call === 'false') {
                        params.TWILIO_MSG_CALL_STATUS += '0'; 
                    } else {
                        params.TWILIO_MSG_CALL_STATUS += '1'; 
                    }
                    delete params.call;

                    if(params.message === 'false') {
                        params.TWILIO_MSG_CALL_STATUS += '0'; 
                    } else {
                        params.TWILIO_MSG_CALL_STATUS += '1'; 
                    }
                    delete params.message;
                    Object.keys(params).forEach(function(k, v) {
                        var temp = {
                            'name' : k,
                            'value': params[k],
                            'description': '',
                            'settings_type':'T'
                        };
                        twilioSettingsResource.save({'jsonrpc': '2.0', 'method': 'add', 'params': temp},
                        function (response) {
                            if (response.error) {
                                $scope.toastrError(response.error.message, {});
                            } 
                        });
                    });
                    $scope.toastrSuccess('Twilio settings successfully saved!!' , {});
                }
                
            };

            function numberSplit(callMessageNumber) {
                var number = callMessageNumber,
                    output = [],
                    sNumber = number.toString();

                for (var i = 0, len = sNumber.length; i < len; i += 1) {
                    output.push(+sNumber.charAt(i));
                }

                return output;
            }

            $scope.init = function () {                
                //calling list if list page is called
                var stateInit = {
                    'ng.settings.twilio': function () {                        
                        $scope.showTwilioSettings();
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


