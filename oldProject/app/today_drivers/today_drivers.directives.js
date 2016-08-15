/***
Today Drivers Directives
***/

(function() {
    'use strict';

    // Show login form and hide forget password
    angular.module('FoodjetsApp').directive('datePaginator', function($timeout) {
        return {
            restrict: 'A',
            scope:{
            	selectedDate: '=selectedDate',
            	onDateChange: '&'
            },
            link: function(scope, elem, attrs) {
            	
            	$timeout(function(){
            		
		        elem.datepaginator({
				onSelectedDateChanged: function(event, date) {
				  
				  scope.selectedDate = moment(date).format('YYYY-MM-DD');
				  scope.$apply();
				  scope.onDateChange();
				 
				}
			});
		},0);
		
            }
        };
    });

})();


(function() {
    'use strict';

   
    angular.module('FoodjetsApp').directive('dragDrop', function($timeout,$window) {
        return {
            restrict: 'A',
            scope:{
            	addDriverToZone: '&',
            	removeDriverFromZone: '&',
            },
            link: function(scope, elem, attrs) {
            	var allowDrop = function(ev) {
		    ev.preventDefault();
		}

		var drag = function(ev) {
		    scope.driverID = attrs.driverId;
		    ev.originalEvent.dataTransfer.setData('text', ev.target.id);
		}

		var drop = function(ev) {
		    ev.preventDefault();
		    try{
		    	    var zoneID = attrs.zoneId;
			    var el = this;
			    var data = ev.originalEvent.dataTransfer.getData('text');
			    el.appendChild(document.getElementById(data));
			    var height = el.offsetHeight;
	    		    var newHeight = height + 70;
			    el.style.height = newHeight + 'px';
			    var driverID = $('#'+data).attr('driver-id');
			    scope.addDriverToZone({'zoneID':zoneID,'driverID':driverID});
			    $('#'+data).find('#remove'+driverID).show();
			    $('#'+data).attr('draggable',false);
			    $('#'+data).find('#remove'+driverID).on('click',function(){
			    	//if($window.confirm('Do you really want to remove the driver from this zone?')){
		    		    	
			    	scope.removeDriverFromZone(
			    	{'zoneID':zoneID,
			    	 'driverID':driverID,
			    	 'callback':function(response){
				    		if(response === true)
				    		{
				    			$(".dragdrop").each(function(){
				    				var el = this;
				    				var newHeight = 70;
				    				el.style.height = newHeight + 'px';
				    			});
				    			
				    		}
			    		
			    		}
			    	});
				//}
			    });
		    }
		    catch(e){
		    	console.log(e);
		    }
		}
		
		if(attrs.dragDrop === 'source')
		{
			elem.on('dragstart',drag);
		}
		if(attrs.dragDrop === 'dest')
		{
			elem.on('drop',drop);
			elem.on('dragover',allowDrop);
		}
            }
        };
    });
    

})();




(function() {
    'use strict';

   
    angular.module('FoodjetsApp').directive('removeDriver', function($timeout,$window) {
        return {
            restrict: 'A',
            scope:{
            	removeDriver: '&'
            },
            link: function(scope, elem, attrs) {
            	elem.on('click',function(){
            		var zoneID = attrs.zoneId;
            		var driverID = attrs.driverId;
		    	scope.removeDriver(
		    	{'zoneID':zoneID,
		    	 'driverID':driverID,
		    	 'callback':function(response){
			    		if(response === true)
			    		{
			    			$(".dragdrop").each(function(){
			    				var el = this;
			    				var newHeight = 70;
			    				el.style.height = newHeight + 'px';
			    			});
			    			
			    		}
		    		
		    		}
		    	});
		});
            }
        };
    });
    

})();
