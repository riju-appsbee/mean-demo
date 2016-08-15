'use strict';

angular.module('FoodjetsApp').directive('polygonMap' , [function(){
	/*return {
		restrict : 'E',
		templateUrl : 'app/market_office/delivery_map_add.html',
		link : function($scope , $element , $attrs) {
			$(function(){
				function initialize() {
	                console.log('called');
	                var mapOptions = {
	                    center: new google.maps.LatLng(-34.397, 150.644),
	                    zoom: 8
	                };

	                var map = new google.maps.Map(document.getElementById('map-canvas'),
	                        mapOptions);

	                var drawingManager = new google.maps.drawing.DrawingManager({
	                    drawingMode: google.maps.drawing.OverlayType.MARKER,
	                    drawingControl: true,
	                    drawingControlOptions: {
	                        position: google.maps.ControlPosition.TOP_CENTER,
	                        drawingModes: [
	                            google.maps.drawing.OverlayType.POLYGON
	                        ]
	                    },
	                    markerOptions: {
	                        icon: 'images/beachflag.png'
	                    },
	                    circleOptions: {
	                        fillColor: '#ffff00',
	                        fillOpacity: 1,
	                        strokeWeight: 5,
	                        clickable: false,
	                        editable: true,
	                        zIndex: 1
	                    }
	                });
	                drawingManager.setMap(map);

	                google.maps.event.addListener(drawingManager, 'overlaycomplete', function(polygon) {
	                    var coordinatesArray = polygon.overlay.getPath().getArray();
	                    console.log(coordinatesArray);
	                });
	            }

	            google.maps.event.addDomListener(window, 'load', initialize);
			});			
		}
	};*/
}]);