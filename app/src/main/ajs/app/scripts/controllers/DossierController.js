'use strict';

define([
    'app',
    'models/DossierModel',
    'services/DossierService',
    'services/CoreService',
    'bootstrap_treeview',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($scope, $translatePartialLoader, $translate, $location, DossierModel, CoreService, DossierService) {

        $translatePartialLoader.addPart('dossier');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.dossierModel = DossierModel;

        function reloadInternal() {
            if (DossierService) {
                DossierService.reload($scope);
            }
        }

        /**  */
        $scope.reload = function () {
            reloadInternal();
        };

        $scope.add = function() {

        };

        $scope.select = function(dossier) {
            DossierModel.setSelectedDossier(dossier);
            $location.url('/dossier/'+dossier.id);
        };

        function init() {
            reloadInternal();
        }
        init();
    };

    app.register.controller('DossierController', ['$scope', '$translatePartialLoader', '$translate', '$location', 'DossierModel', 'CoreService', 'DossierService', ctrl]);
});

