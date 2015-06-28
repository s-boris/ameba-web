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

        return result;
    };

    app.factory('DossierService', ['$http', '$q', 'CoreService', 'DossierModel', srv]);
});