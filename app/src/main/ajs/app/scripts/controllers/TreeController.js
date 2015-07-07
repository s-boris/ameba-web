/**
 * Created by axbsi01 on 01.07.2015.
 */

'use strict';

define([
    'app'
], function (app) {

    var ctrl = function ($rootScope, $scope, $stateParams, $state, $translatePartialLoader, $translate, CoreConfig, FolderModel, DossierModel, DossierService, FolderService, toaster) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.folderModel = FolderModel;
        $scope.change = false;

        $scope.selectTreeElement = function (branch) {

            $scope.folderModel.selectedEntity = branch.obj;
            $scope.folderModel.selectedType = branch.type;

            $scope.hasMetadataChanged=false;

            if(FolderModel.selectedType == 'document'){
                $rootScope.$emit(CoreConfig.events.TREE_CLICKED, FolderModel.selectedEntity);
            }
        };

        $scope.treeElementSelected = function(){
          if($scope.folderModel.selectedEntity){
              return true;
          } else {
              return false;
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

        $scope.metaDataChanged = function() {
            $scope.hasMetadataChanged=true;
        };


        $scope.add = function () {
            var parentFolder = findParentFolder($scope.folderModel.selectedEntity.identifier, $scope.folderModel.selectedDossier);

            if($scope.newFolder) {
                if ($scope.folderModel.selectedDossier.identifier == parentFolder.identifier || !$scope.folderModel.selectedDossier.folders) {
                    FolderService.addFolder($scope.newFolder, $scope).then(function(result){
                        reload(result);
                    });
                } else {
                    angular.forEach($scope.folderModel.selectedDossier.folders, function (folder) {
                        var newFolderStructure = addFolderToStructure(angular.copy(folder), parentFolder, $scope.newFolder);
                        if (!angular.equals(newFolderStructure, folder)) {
                            FolderService.addFolder(newFolderStructure, $scope).then(function(result){
                                reload(result);
                            });
                        }
                    });
                }
            } else if($scope.newDocument){
                angular.forEach($scope.folderModel.selectedDossier.folders, function (folder) {
                    var newFolderStructure = addDocumentToStructure(angular.copy(folder), parentFolder, $scope.newDocument);
                    if (!angular.equals(newFolderStructure, folder)) {
                        FolderService.addDocument(newFolderStructure, $scope).then(function(result){
                            reload(result);
                        });
                    }
                });
            }
        };

        function reload(result) {
            if (result.httpStatus == "201") {
                toaster.pop('info', result.message);
                //force reload
                DossierService.load(DossierModel.selectedDossier, $scope).then(
                    function (dossier) {
                        DossierModel.selectedDossier = dossier;
                        $scope.newFolder = undefined;
                        $scope.newDocument = undefined;
                        $state.go("parent.folder", {'id': DossierModel.selectedDossier.identifier});
                        angular.element('#addDialog').modal('hide');
                    },
                    function (e) {
                    }
                );
            } else {
                toaster.pop('error', result.message);
            }
        }

        function addFolderToStructure(currentFolderStructure, parentFolder, newFolder) {
            if (currentFolderStructure.identifier == parentFolder.identifier) {
                if (!currentFolderStructure.subFolders) {
                    currentFolderStructure.subFolders = [];
                }
                currentFolderStructure.subFolders.push(newFolder);
                return currentFolderStructure;
            } else {
                if (currentFolderStructure.subFolders) {
                    for (var i = 0, len = currentFolderStructure.subFolders.length; i < len; i++) {
                        if (currentFolderStructure.subFolders[i].identifier == parentFolder.identifier) {
                            if (!currentFolderStructure.subFolders[i].subFolders) {
                                currentFolderStructure.subFolders[i].subFolders = [];
                            }
                            currentFolderStructure.subFolders[i].subFolders.push(newFolder);
                        } else {
                            addFolderToStructure(currentFolderStructure.subFolders[i], parentFolder, newFolder);
                        }
                    }
                }
            }
            return currentFolderStructure;
        }

        function findParentFolder(identifier, element){
            var result = undefined;
            if(element.identifier == identifier) {
                return element;
            }

            if (element.documents) {
                for (var i = 0, len = element.documents.length; i < len; i++) {
                    if (element.documents[i].identifier == identifier) {
                        return element;
                    }
                }
            }

            if(element.folders) {
                //this is a dossier
                if (element.folders) {
                    for (var b = 0, len2 = element.folders.length; b < len2; b++) {
                        result = findParentFolder(identifier, element.folders[b]);
                        if(result){
                            return result;
                        }
                    }
                }
            } else {
                if (element.subFolders) {
                    for (var b = 0, len2 = element.subFolders.length; b < len2; b++) {
                        result = findParentFolder(identifier, element.subFolders[b]);
                        if (result) {
                            return result;
                        }
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
                noLeaf: true,
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
            angular.forEach(rootFolder.subFolders, function (folder) {
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

    app.register.controller('TreeController', ['$rootScope', '$scope', '$stateParams', '$state', '$translatePartialLoader', '$translate', 'CoreConfig', 'FolderModel', 'DossierModel', 'DossierService', 'FolderService', 'toaster', ctrl]);
});