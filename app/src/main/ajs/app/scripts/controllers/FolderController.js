'use strict';

define([
    'app',
    'models/DossierModel',
    'models/FolderModel',
    'services/CoreService',
    'bootstrap_treeview',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($scope, $translatePartialLoader, $translate, $location, $stateParams, DossierModel, FolderModel, DossierService, CoreService) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.folderModel = FolderModel;

        function getTree() {

            var tree = [
                {
                    text: $scope.folderModel.selectedDossier.dossierId,
                    state: {
                        expanded: true,
                    },
                    nodes: [/*
                        {
                            text: "Child 1",
                            nodes: [
                                {
                                    text: "Grandchild 1"
                                },
                                {
                                    text: "Grandchild 2"
                                }
                            ]
                        },
                        {
                            text: "Child 2"
                        }
                    */]
                }
            ];

            angular.forEach(FolderModel.selectedDossier.folderModel, function(folder){
                tree.nodes.add(folder)
            });

            return tree;
        };

        function init() {
            if (DossierModel && DossierModel.selectedDossier) {

                // use model to build view ... initialize folderModel
                $scope.folderModel.selectedDossier = DossierModel.selectedDossier;
            } else {

                // we come from a reloaded page
                DossierService.reload($scope).then(
                    function() {
                        angular.forEach(DossierModel.dossiers, function(dossier) {
                            if (dossier.identifier === $stateParams.id) {
                                $scope.folderModel.selectedDossier = dossier;
                            }
                        });
                    },
                    function(e) {

                    }
                );
            }
            angular.element('#tree').treeview({data: getTree()});
            console.dir(DossierModel.selectedDossier);
        }
        init();
    };

    app.register.controller('FolderController', ['$scope', '$translatePartialLoader', '$translate', '$location', '$stateParams', 'DossierModel', 'FolderModel', 'DossierService', 'CoreService', ctrl]);
});

