'use strict';

define([
    'app',
    'models/DossierModel',
    'services/CoreService',
    'bootstrap_treeview',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($scope, $translatePartialLoader, $translate, $location, DossierModel, CoreService) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.dossierModel = DossierModel;


        function init() {
        }
        init();
    };

    app.register.controller('FolderController', ['$scope', '$translatePartialLoader', '$translate', '$location', 'DossierModel', 'CoreService', ctrl]);
});

