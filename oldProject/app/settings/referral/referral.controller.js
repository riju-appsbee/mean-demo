(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('ReferralSettingsController', 
    ['$rootScope',
        '$stateParams',
        '$state', 
        '$scope',
        '$location',
        'referralSettingsResource',
        'Globalutc',
        function ($rootScope, 
        	  $stateParams, 
        	  $state, 
        	  $scope, 
        	  $location, 
        	  referralSettingsResource, 
        	  Globalutc) {
            
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            
            //For listing
            $scope.ref = {};
          
            
            //For form data
            $scope.params = {};

            //Fetch all settings
            $scope.list = function () {
                referralSettingsResource.get({method: 'list'},
                function (response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                    	$scope.params = {};
                    	$scope.ref = {};
                        angular.forEach(response.result,function(value,key){
                        	$scope.params[value.name.toLowerCase()] = value.value;
                        	$scope.ref[value.name] = {id:value.id,created_at:value.created_at};	
                        });
                    }
                });
            };            

            //Edit settings by ID            
            $scope.update = function ($valid) {
                if ($valid) {
                    var updateParams = [];
                    angular.forEach($scope.params,function(val,key){
                    	var name = key.toUpperCase();
                    	var id = null;
                    	if($scope.ref[name] !== undefined)
                    	{
                    		if($scope.ref[name].id !== undefined)
                    		{
                    			id = $scope.ref[name].id;
                    		}
                    	}
                    	if(id === null)
                    	{
                    		var object = {
                    			id:id,
		            		name:name,
		            		value:val,
		            		settings_type:'REF',
		            		description: '',
		            		created_at:Globalutc.now(),
		            		updated_at:Globalutc.now()
                    		}
                    	}
                    	else
                    	{
                    		var object = {
                    			id:id,
		            		name:name,
		            		value:val,
		            		settings_type:'REF',
		            		description: '',
		            		created_at:$scope.ref[name].created_at,
		            		updated_at:Globalutc.now()
                    		}
                    	}
                    		
                    	updateParams.push(object);
                    });
                    
                    referralSettingsResource.save({'jsonrpc': '2.0', 'method': 'update', 'params': updateParams},
		            function (response) {
		                if (response.error) {
		                    $scope.toastrError(response.error.message, {});
		                } else {
		                    $scope.toastrSuccess(response.result.message, {});                            
		                }
		    });
                }
                
            };

            $scope.init = function () {                
                //calling list if list page is called
                var stateInit = {
                    'ng.settings.referral': function () {                        
                        $scope.list();
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
