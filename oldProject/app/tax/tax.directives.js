(function() {
    'use strict';
    // Angular file upload directive get the file data url (base64data)
    angular.module('FoodjetsApp').directive('validFileUpload', ['$parse', function($parse) {
    	var validFormats = ['csv'];
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                //console.log(attrs);
                var model = $parse(attrs.validFileUpload);
                var modelSetter = model.assign;
               
		element.on('change', function() {
                    var file = element[0].files[0],
                    value = (file)  ? file.name : "",
                    ext = value.substring(value.lastIndexOf('.') + 1).toLowerCase();  
                    try{
			 reader = new FileReader();

			 reader.onloadend = function(e) { 
				scope.$apply(function() {
				    modelSetter(scope, e.target.result);
				    ngModel.$validators.validFile = function() {
					    return validFormats.indexOf(ext) !== -1;
				    };
				});
			 };
	
			 reader.readAsDataURL(file);
		    }
		    catch(e)
		    {
			 console.log(e);
		    }

               });
                
            }
        };
    }]);
})();
