/**
 * Created by axbsi01 on 01.07.2015.
 */

'use strict';

define([
    'app'
], function (app) {

    var ctrl = function ($rootScope, $scope, $translatePartialLoader, $translate, CoreConfig, FolderModel, DossierModel, DossierService) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.folderModel = FolderModel;

        $scope.selectTreeElement = function (branch) {

            $scope.folderModel.selectedEntity = branch.obj;
            $scope.folderModel.selectedType = branch.type;

            if(FolderModel.selectedType == 'document'){
                $rootScope.$emit(CoreConfig.events.TREE_CLICKED, FolderModel.selectedEntity);
            }
        };

        $scope.addSelection = function (selection) {
            if(selection == 'folder'){
                angular.element("#addDocumentForm").css('display', 'none');
                angular.element("#addFolderForm").show();
            } else {
                angular.element("#addFolderForm").css('display', 'none');
                angular.element("#addDocumentForm").show();
            }
        };

        $scope.add = function () {
            var parentFolder = findParentFolder($scope.folderModel.selectedEntity.identifier, $scope.folderModel.selectedDossier);


        };

        function findParentFolder(identifier, pFolder){
            var result = undefined;
            if(pFolder.identifier == identifier) {
                return pFolder;
            }

            if (pFolder.documents) {
                for (var i = 0, len = pFolder.documents.length; i < len; i++) {
                    if (pFolder.documents[i].identifier == identifier) {
                        return pFolder;
                    }
                }
            }

            if (pFolder.folders) {
                for (var b = 0, len2 = pFolder.folders.length; b < len2; b++) {
                    result = findParentFolder(identifier, pFolder.folders[b]);
                    if(result){
                        return result;
                    }
                }
            }
            return result;
        }


        function getTree() {
            var folderDocumentStructure = [];
            angular.forEach($scope.folderModel.selectedDossier.folders, function (folder) {
                folderDocumentStructure.push(buildFolderStructure(folder));
            });

            var tree = [{
                id: $scope.folderModel.selectedDossier.identifier,
                obj: $scope.folderModel.selectedDossier,
                type: "dossier",
                label: $scope.folderModel.selectedDossier.dossierId,
                children: folderDocumentStructure
            }];

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
                    children: []
                };
                documentArray.push(thisDocument);
            });

            var folderArray = [];
            angular.forEach(rootFolder.folders, function (folder) {
                folderArray.push(buildFolderStructure(folder));
            });

            //merge documents and subfolders
            thisFolder.children = folderArray.concat(documentArray);

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

    app.register.controller('TreeController', ['$rootScope', '$scope', '$translatePartialLoader', '$translate', 'CoreConfig', 'FolderModel', 'DossierModel', 'DossierService', ctrl]);
});