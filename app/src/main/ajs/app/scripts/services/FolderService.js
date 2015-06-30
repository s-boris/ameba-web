'use strict';

define([
    'app',
    'models/FolderModel'
], function (app) {

    var srv = function ($http, $q, CoreService, FolderModel) {

        var result = {
            document: "/documents"
        };

        result.getDocument = function (id, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            var delay = $q.defer();
            $http({method: 'GET', url: scope.rootUrl + result.document + '/' + id + '/content', headers: headers})
                .success(function (data) {
                    FolderModel.document = data;
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };

        return result;
    };

    app.factory('FolderService', ['$http', '$q', 'CoreService', 'FolderModel', srv]);
});