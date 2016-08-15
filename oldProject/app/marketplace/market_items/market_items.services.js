(function() {
    'use strict';

    angular.module('FoodjetsApp')
    .factory('MarketItemsService', ['$resource',
        function($resource) {

            return $resource('/api/market-items/:method/:id',{
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
  angular.module('FoodjetsApp').factory('MarketItemSearchService' , ["$resource", function($resource){
    return $resource('/api/query/search-path/',{
          q: '@q',
          path: '@path'
        }, {
            send: { method: 'POST' }
        });
  }]);

})();
