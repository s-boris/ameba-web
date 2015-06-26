'use strict';

define([
    'app',
    'models/DossierModel'
], function (app) {

    var srv = function ($http, $q, CoreService, DossierModel) {

        var result = {
            dossier: "/dossier"
        };

        result.reload = function (scope) {
            var delay = $q.defer();
            CoreService.getAll(result.dossier, scope, scope.getHeader()).then(
                function (dossiers) {
                    DossierModel.setDossiers(dossiers);
                    delay.resolve();
                }, function (e) {
                    delay.reject(e);
                }
            );
            return delay.promise;
        };

    };

    app.factory('DossierService', ['$http', '$q', 'CoreService', 'DossierModel', srv]);
});