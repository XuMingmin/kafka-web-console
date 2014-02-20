var app = angular.module('app', ['ngRoute', 'ui.bootstrap'], function ($httpProvider) {

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.common['Accept'] = 'text/html';

        $httpProvider.defaults.transformRequest = [function (data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
            var param = function (obj) {
                var query = '';
                var name, value, fullSubName, subName, subValue, innerObj, i;

                for (name in obj) {
                    value = obj[name];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                    else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                    else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];
    }
)
    .config(function ($routeProvider) {
        $routeProvider
            .when('/zookeepers', {
                controller: 'ZookeepersController',
                templateUrl: '/zookeepers'
            })
            .when('/topics', {
                controller: 'TopicsController',
                templateUrl: '/topics'
            })
            .when('/brokers', {
                controller: 'ZookeepersController',
                templateUrl: '/brokers'
            })
            .when('/consumergroups/zookeeper/:zookeeper/topic/:topic', {
                controller: 'ConsumerGroupsController',
                templateUrl: function(params) {
                    return '/consumergroups/zookeeper/' + params.zookeeper + '/topic/' + params.topic
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    });

app.run(function($rootScope, $templateCache) {
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if (typeof(current) !== 'undefined'){
            $templateCache.remove(current.templateUrl);
        }
    });
});

app.service('feedService', function ($location) {
    ws = new WebSocket('ws://' + $location.host() + ':' + $location.port() + '/feed');
    return ws
});