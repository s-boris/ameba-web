'use strict';

define([
    'app',
    'models/FolderModel'
], function (app) {

    var srv = function ($http, $q, CoreService, FolderModel) {

        var result = {
            document: "/documents",
            folder: "/folders",
            dossier: "/dossiers"
        };

        result.getDocument = function (id, scope) {
            var headers = scope.getHeader();
            var delay = $q.defer();
            $http({method: 'GET', url: scope.rootUrl + result.document + '/' + id + '/content', headers: headers})
                .success(function (data) {
                    FolderModel.document = data.obj[0].content;
                    delay.resolve();
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };


        result.addFolder = function (newFolderStructure, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            $http(
                {
                    method: 'POST',
                    url: scope.rootUrl + result.dossier + '/' + scope.folderModel.selectedDossier.dossierId + result.folder,
                    headers: headers,
                    data: newFolderStructure
                })
                .success(function (data) {
                    delay.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };

        result.addDocument = function (newDocument, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            $http(
                {
                    method: 'POST',
                    url: scope.rootUrl + result.document,
                    headers: headers,
                    data: newDocument
                })
                .success(function (data) {
                    delay.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };

        result.saveFolder = function (updatedFolder, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            $http(
                {
                    method: 'PUT',
                    url: scope.rootUrl + result.dossier + '/' + scope.folderModel.selectedDossier.dossierId + result.folder + '/' + updatedFolder.identifier,
                    headers: headers,
                    data: updatedFolder
                })
                .success(function (data, status) {
                    if(status == "201") {
                        delay.resolve(data);
                    } else {
                        delay.reject(new Error(status));
                    }
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