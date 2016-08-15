(function(){
  'use strict';
  angular.module('FoodjetsApp').factory('mrktCatSearchService' , ["$resource", function($resource){
    return $resource('/api/query/search-path/',{
          q: '@q',
          path: '@path'
        }, {
            send: { method: 'POST' }
        });
  }]);

})();