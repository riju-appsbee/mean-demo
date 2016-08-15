(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('AlcoholItemsService', ['$resource',
        function($resource) {

            return $resource('/api/alcohol-items/:method/:id',{
            	method: '@method',
            	id: '@id'
            }, {
                send: { method: 'POST' }
            });
        }
    ]);
})();


(function(){
  'use strict';
  angular.module('FoodjetsApp').factory('AlcoholItemSearchService' , ["$resource", function($resource){
    return $resource('/api/query/search-path/',{
          q: '@q',
          path: '@path'
        }, {
            send: { method: 'POST' }
        });
  }]);

})();
