'use strict';

define([
    'app',
    'models/DossierModel',
    'services/DossierService'
], function (app) {

    var ctrl = function ($scope, DossierModel, DossierService) {

        /** Model binding for view. */

        $scope.select = function (tableGroup) {
        };

        function reloadInternal() {
            if (DossierService) {
                DossierService.reload();
            }
        }

        /**  */
        $scope.reload = function () {
            reloadInternal();
        };

        function init() {
            console.log(DossierModel);
            console.log(DossierService);
            reloadInternal();
        }

        init();
    };

    app.register.controller('DossierController', ['$scope', 'DossierModel', 'DossierService', ctrl]);
});

