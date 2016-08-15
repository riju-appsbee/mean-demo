(function () {
    'use strict';

    angular.module('FoodjetsApp').controller('RewardSettingController', 
    ['$rootScope',
        '$stateParams',
        '$state', 
        '$scope',
        '$location',
        'rewardSettingsResource',
        'Globalutc',
        function ($rootScope, 
        	  $stateParams, 
        	  $state, 
        	  $scope, 
        	  $location, 
        	  rewardSettingsResource, 
        	  Globalutc) {
            
            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            
            //For listing
            $scope.ref = {};
          
            
            //For form data
            $scope.npParams = {
            	point_limit:'',
            	credit_limit:''
            };
            $scope.rocParams = {
            	dollar_amount: '',
            	gain_point: ''
            };

            //Fetch all settings
            $scope.list = function () {
            	
                rewardSettingsResource.get({method: 'list'},
                function (response) {
                    if (response.error) {
                        $scope.toastrError(response.error.message, {});
                    } else {
                    	
                    	$scope.ref = {};
                        angular.forEach(response.result,function(value,key){
                        	
                        	if(value.settings_type === 'ROC'){
                        		$scope.rocParams[value.name.toLowerCase()] = value.value;
                        	}
                        	if(value.settings_type === 'NP'){
                        		$scope.npParams[value.name.toLowerCase()] = value.value;
                        	}
                        		
                        	$scope.ref[value.name] = {id:value.id,created_at:value.created_at};	
                        });
                    }
                });
            };            

            //Edit settings by ID            
            $scope.update = function ($valid,type) {
                if ($valid) {
                    var params = {};
                    if(type === 'NP')
                    {
                    	params = $scope.npParams;
                    }
                    if(type === 'ROC')
                    {
                    	params = $scope.rocParams;
                    }
                    var updateParams = [];
                    angular.forEach(params,function(val,key){
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
		            		settings_type:type,
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
		            		settings_type:type,
		            		description: '',
		            		created_at:$scope.ref[name].created_at,
		            		updated_at:Globalutc.now()
                    		}
                    	}
                    		
                    	updateParams.push(object);
                    });
                    //console.log(updateParams);
                    //return false;
                    rewardSettingsResource.save({'jsonrpc': '2.0', 'method': 'update', 'params': updateParams},
		            function (response) {
		                if (response.error) {
		                    $scope.toastrError(response.error.message, {});
		                } else {
		                    $scope.toastrSuccess(response.result.message, {});                            
		                }
		    });
                }
                
            };
            
            $scope.reset = function(type){
            	    if(type === 'NP')
                    {
                    	$scope.npParams = {
			    	point_limit:'',
			    	credit_limit:''
			    };
                    }
                    if(type === 'ROC')
                    {
                    	$scope.rocParams = {
			    	dollar_amount: '',
			    	gain_point: ''
			    };
                    }
            };

            $scope.init = function () {                
                //calling list if list page is called
                var stateInit = {
                    'ng.settings.reward-point': function () {                        
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
