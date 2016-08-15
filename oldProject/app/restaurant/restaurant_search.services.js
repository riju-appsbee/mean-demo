(function(){
  'use strict';
  angular.module('FoodjetsApp').factory('restaurantSearchService' , ["$resource", function($resource){
    return $resource('/api/query/search-path/',{
          q: '@q',
          path: '@path'
        }, {
            send: { method: 'GET' }
        });
  }]);

})();