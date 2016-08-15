(function(){
  'use strict';
  angular.module('FoodjetsApp').factory('alcoholStoreSearchService' , ["$resource", function($resource){
    return $resource('/api/query/search-path/',{
          q: '@q',
          path: '@path'
        }, {
            send: { method: 'POST' }
        });
  }]);

})();