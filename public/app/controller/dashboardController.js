'use strict';

/**
 * @ngdoc function
 * @name nodeStartUpApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the nodeStartUpApp
 */


angular.module('nodeStartUpApp')
	.controller('dashboardController', ["$http", "$location", "$localStorage", "$timeout", 
		function($http, $location, $localStorage, $timeout) {
			
			var self = this;			
			self.users = {};
			if ($localStorage.id == undefined || $localStorage.id <= 0) {
				$location.path('/superadmin/login');
			}else{
				self.id = $localStorage.id;
				self.name = $localStorage.name;
				
			}

			$timeout(function() {
				
				//knob
	      
		        $(".knob").knob({
		          'draw' : function () { 
		            $(this.i).val(this.cv + '%')
		          }
		        })
	      

	      		//carousel
	      
				$("#owl-slider").owlCarousel({
				  navigation : true,
				  slideSpeed : 300,
				  paginationSpeed : 400,
				  singleItem : true

				});
	      

	  			//custom select box

	      
				$('select.styled').customSelect();
	      
		  
				/* ---------- Map ---------- */
		
				$('#map').vectorMap({
				map: 'world_mill_en',
				series: {
				  regions: [{
				    values: gdpData,
				    scale: ['#000', '#000'],
				    normalizeFunction: 'polynomial'
				  }]
				},
				backgroundColor: '#eef3f7',
				onLabelShow: function(e, el, code){
				  el.html(el.html()+' (GDP - '+gdpData[code]+')');
				}
				});
	
			},0);

		}
	]);