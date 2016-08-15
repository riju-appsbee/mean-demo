(function () {
    'use strict';

    angular.module('FoodjetsApp')
            .factory('dynamoResource', ['$resource',
                function ($resource) {

                    return $resource('/api/dynamo/:method', {
                        method: '@method'
                    }, {
                        send: {method: 'POST'}
                    });
                }
            ]);
})();
