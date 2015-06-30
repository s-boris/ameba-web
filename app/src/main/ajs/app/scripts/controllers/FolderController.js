'use strict';

define([
    'app',
    'models/DossierModel',
    'models/FolderModel',
    'services/CoreService',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($scope, $translatePartialLoader, $translate, $location, $state, $stateParams, DossierModel, FolderModel, DossierService, CoreService) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.folderModel = FolderModel;

        $scope.back = function(){
            $state.go("parent.dossier");
        };

        $scope.selectTreeElement = function(branch) {
            console.log(branch);
            $scope.folderModel.selectedEntity = branch.obj;
            $scope.folderModel.selectedType = branch.type;
        };

        function getTree() {
            var folderDocumentStructure = [];
            angular.forEach($scope.folderModel.selectedDossier.folders, function (folder) {
                folderDocumentStructure.push(buildFolderStructure(folder));
            });

            var tree = [
                {
                    id: $scope.folderModel.selectedDossier.identifier,
                    obj: $scope.folderModel.selectedDossier,
                    type: "dossier",
                    label: $scope.folderModel.selectedDossier.dossierId,
                    children: folderDocumentStructure
                }
            ];

            return tree;
        }

        function buildFolderStructure(rootFolder) {
            var thisFolder = {
                id: rootFolder.identifier,
                obj: rootFolder,
                type: "folder",
                label: rootFolder.name,
                children: []
            };

            var documentArray = [];
            angular.forEach(rootFolder.documents, function (document) {
                var thisDocument = {
                    id: document.identifier,
                    obj: document,
                    type: "document",
                    label: document.name,
                    icon: "glyphicon glyphicon-list-alt",
                    children: []
                };
                documentArray.push(thisDocument);
            });

            var folderArray = [];
            angular.forEach(rootFolder.folders, function (folder) {
                folderArray.push(buildFolderStructure(folder));
            });

            //merge documents and subfolders
            var substructure = folderArray.concat(documentArray);
            thisFolder.children = substructure;

            return thisFolder;

        }

        function init() {

            $.material.init();

            if (DossierModel && DossierModel.selectedDossier) {

                // use model to build view ... initialize folderModel
                $scope.folderModel.selectedDossier = DossierModel.selectedDossier;
            } else {

                // we come from a reloaded page
                DossierService.reload($scope).then(
                    function () {
                        angular.forEach(DossierModel.dossiers, function (dossier) {
                            if (dossier.identifier === $stateParams.id) {
                                $scope.folderModel.selectedDossier = dossier;
                            }
                        });
                    },
                    function (e) {

                    }
                );
            }
            $scope.data = getTree();

        }

        init();
    };

    app.register.controller('FolderController', ['$scope', '$translatePartialLoader', '$translate', '$location', '$state', '$stateParams', 'DossierModel', 'FolderModel', 'DossierService', 'CoreService', ctrl]);
});

