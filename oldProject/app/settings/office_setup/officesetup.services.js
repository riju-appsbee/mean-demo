(function () {
    'use strict';

    angular.module('FoodjetsApp')
            .factory('officeSetupResource', ['$resource',
                function ($resource) {

                    return $resource('/api/settings/office-setup/:method/:state/:id', {
                        method: '@method',
                        state: '@state',
                        id: '@id'
                    }, {
                        send: {method: 'POST'}
                    });
                }
            ]);
})();
