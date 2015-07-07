'use strict';

define([
    'app',
    'models/DossierModel'
], function (app) {

    var srv = function ($http, $q, CoreService, DossierModel) {

        var result = {
            dossier: "/dossiers"
        };

        result.reload = function (scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            CoreService.getAll(result.dossier, scope, headers).then(
                function (dossiers) {
                    DossierModel.setDossiers(dossiers);
                    delay.resolve();
                }, function (e) {
                    delay.reject(e);
                }
            );
            return delay.promise;
        };

        result.load = function (selectedDossier, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            $http(
                {
                    method: 'GET',
                    url: scope.rootUrl + result.dossier + '?dossierId=' + scope.folderModel.selectedDossier.dossierId,
                    headers: headers
                })
                .success(function (data, status) {
                    if(status == "200" && data.httpStatus == '200') {
                        delay.resolve(data.obj[0]);
                    } else {
                        delay.reject(new Error(status));
                    }
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };

        result.save = function (updatedDossier, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            $http(
                {
                    method: 'PUT',
                    url: scope.rootUrl + result.dossier + '/' + updatedDossier.dossierId,
                    headers: headers,
                    data: updatedDossier
                })
                .success(function (data, status) {
                    if(status == "204") {
                        var newData ={};
                        newData.httpStatus = '204';
                        delay.resolve(newData);
                    } else {
                        delay.reject(new Error(status));
                    }
                })
                .error(function (data, status, headers, config) {
                    delay.reject(new Error(status, config));
                });
            return delay.promise;
        };

        result.create = function (dossier, scope) {
            var delay = $q.defer();
            var headers = scope.getHeader();
            CoreService.add(result.dossier, scope, dossier, headers).then(
                function (dossiers) {
                    DossierModel.setDossiers(dossiers);
                    delay.resolve();
                }, function (e) {
                    delay.reject(e);
                }
            );
            return delay.promise;
        };

        return result;
    };

    app.factory('DossierService', ['$http', '$q', 'CoreService', 'DossierModel', srv]);
});