'use strict';
define([
    'app'
], function (app) {

    var srv = function ($http, $q, $cookies, $base64, $rootScope, CoreConfig) {

        var result = {};

        result.login = function (rootScope, scope) {
            var delay = $q.defer();
            $http.post(scope.rootUrl + CoreConfig.url.security.login, {username: scope.user.username, password: scope.user.password})
                .success(function (response) {
                    delay.resolve(response);
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };

        result.setCredentials = function (rootScope, scope, data) {
            var authdata = $base64.encode(scope.user.username + ':' + scope.user.password);

            rootScope.globals.security = {
                currentUser: {
                    username: scope.user.username,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookies.globalSecurity = rootScope.globals.security;
        };

        result.clearCredentials = function (rootScope) {
            rootScope.globals = {
                security : {}
            };
            $cookies.globalSecurity = undefined;
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return result;
    };

    app.factory('AuthenticationService', ['$http', '$q', '$cookies', '$base64', '$rootScope', 'CoreConfig', srv]);

});
