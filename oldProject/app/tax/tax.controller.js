(function() {
	'use strict';

	angular.module('FoodjetsApp').controller('TaxController' , 
	[ '$rootScope',
	'$scope',
	'taxService', 
	'$stateParams', 
	'$state' , 
	'$location', 
	'$window',
        '$modal',
	function($rootScope, $scope, taxService, $stateParams, $state, $location, $window, $modal){

		// set sidebar closed and body solid layout mode
		$rootScope.settings.layout.pageContentWhite = true;
		$rootScope.settings.layout.pageBodySolid = false;
		$rootScope.settings.layout.pageSidebarClosed = false;

		// Default values set for state
		$scope.states = [
			{id:'CA', value:'California'},
			{id:'AZ', value:'Arizona'}
		];
		
		//Error
		$scope.errors = {
			status: false,
			msg: ''
		};
		
		
		//Tax
		$scope.listOfTaxes = [];
		
		
		//state selected - from url
		$scope.selectedState = $stateParams.state || 'CA';
		
		//paging
		$scope.maxSize = 1;
		$scope.numPerPage = 1;
		$scope.pageChanged = function() {
			$scope.taxList();
		 };
		 
		 // Search tax
		 $scope.searchTax = function() {
		        $scope.taxCount();
		 };
		
		//tax listing
		 $scope.taxCount = function() {
		 	$scope.listOfTaxes = [];
			$scope.totalItems = 0;
		        $scope.numPerPage = 1;
		        $scope.maxSize = 1;
		        taxService.get({
		            method: 'count',
		            state: $scope.selectedState,
		            q: $scope.searchText,
		        }, function(response) {
		            if (response.error) {
		                $scope.toastrError(response.error.message, {});
		                $scope.errors = {
						status: true,
						msg: response.error.message
					};
				
				
		            } else {
		                $scope.totalItems = response.result.count;
		                $scope.numPerPage = response.result.numPerPage;
		                $scope.maxSize = response.result.maxSize;
		                if($scope.totalItems > 0)
		                {
		                	$scope.errors = {
						status: false,
						msg: ''
					};
		                	$scope.taxList();
		                	
		                }
		                else
		                {
		                	$scope.errors = {
						status: true,
						msg: 'No Records Found.'
					};
		                }

		                
		            }
		        });
		 };
		
		//get tax listing
		$scope.taxList = function() {
		  taxService.get({
		  	'method':'list',
		  	'state': $scope.selectedState,
		  	'p': $scope.currentPage,
		  	'q': $scope.searchText,
		  }, function(response){    
		    
		    if(response.error){
		      $scope.errors.msg = response.error.message;
		      $scope.errors.status = true;
		    } else {
		      $scope.listOfTaxes = response.result;
		    }
		  });
		};
		
		
		//change the current state selected
		$scope.changeState = function(state){
			$scope.searchText = '';
			$scope.totalItems = 0;
			$scope.selectedState = state;
			$scope.taxCount();
		};
		
		
		
		
		
		//import tax csv file popup
	        $scope.animationsEnabled = true;
	        $scope.importCsvPopup = function (size) {
	        var modalInstance = $modal.open({
	            animation: $scope.animationsEnabled,
	            templateUrl: 'import_csv',
	            controller: 'TaxModalInstanceCtrl',
	            size: size,
	            resolve: {
	                selectedState: function () {
	                    return $scope.selectedState;
	                }
	            }
	        });

	        modalInstance.result.then(function (selectedItem) {
	            console.log(selectedItem);
	        });
	        };
		
		//on page load
		$scope.init = function(){
			$scope.taxCount();       
		};

		$scope.init();
		
	}]);

})();



(function(){
    'use static';
    angular.module('FoodjetsApp').controller('TaxModalInstanceCtrl',
    ['$scope', '$modalInstance','taxService', 'selectedState', '$state',
    function ($scope, $modalInstance, taxService, selectedState, $state) {
	$scope.params = {
		filename: ''
	};
        
        //error
	$scope.fileError = '';
	
	//state
	$scope.selectedState = selectedState;

       //add tax
	$scope.addTax = function($valid){
	
		if($valid)  { 
		    taxService.save({'jsonrpc':'2.0',
		    		    'method':'import',
		    		    'state':selectedState,
		    		    'params':$scope.params},
		      function(response) {
		     
			      if(typeof response.error === "object"){
				$scope.toastrError(response.error.message, {});
				
			      } else {
				$scope.toastrSuccess(response.result.message, {});
				$scope.cancel();
				$state.go('ng.tax.list',{'state':selectedState});
			      } 
		    });   
		    
		    
		  }
	};

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };
    }]);
})();

