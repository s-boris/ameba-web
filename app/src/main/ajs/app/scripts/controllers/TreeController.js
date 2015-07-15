/**
 * Created by axbsi01 on 01.07.2015.
 */

'use strict';

define([
    'app'
], function (app) {

    var ctrl = function ($rootScope, $scope, $q, $location, $stateParams, $state, $translatePartialLoader, $translate, localStorageService, CoreConfig, FolderModel, DossierModel, DossierService, FolderService, toaster) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.folderModel = FolderModel;

        /** Binding for tree controls**/
        var tree;
        $scope.my_tree = tree = {};

        $scope.showAddDialog = undefined;

        $scope.selectTreeElement = function (branch) {
            $scope.folderModel.selectedEntity = angular.copy(branch.obj);
            $scope.folderModel.selectedType = angular.copy(branch.type);
            $scope.hasMetadataChanged=false;
            $rootScope.$emit(CoreConfig.events.TREE_CLICKED, $scope.folderModel);
        };

        $scope.setForm = function (form) {
            $scope.form = form;
        };

        $scope.metaDataChanged = function() {
            $scope.hasMetadataChanged=true;
        };

        $scope.delete = function(){
            if($scope.folderModel.selectedType == 'folder'){
                /** We currently haven no rest service to delete folders */
               /* FolderService.deleteFolder($scope.folderModel.selectedEntity, $scope).then(function(result){
                    reload(result);
                });*/
            } else {
                FolderService.deleteDocument($scope.folderModel.selectedEntity.identifier, $scope).then(function(result){
                    reload(result);
                });
            }
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
                var input = document.getElementById('inputFile');
                $scope.newDocument.documentContent = {};
                $scope.newDocument.name = input.files[0].name;
                readFile(input.files[0]).then(function(dataString){
                    var mimeType = dataString.match(new RegExp("data:" + "(.*)" + ";base64,"))[1];
                    var content = dataString.match(new RegExp(";base64," + "(.*)" + ""))[1];
                    $scope.newDocument.mimeType = mimeType;
                    $scope.newDocument.documentContent.mimeType = mimeType;
                    $scope.newDocument.documentContent.content = content;
                    FolderService.addDocument(parentFolder, $scope.newDocument, $scope).then(function(result){
                        reload(result);
                    });
                });
            }
        };

        $scope.save = function () {
            if($scope.hasMetadataChanged){
                localStorageService.set('updatedEntity', FolderModel.selectedEntity);
                if(FolderModel.selectedType == 'dossier'){
                    DossierService.save(FolderModel.selectedEntity, $scope).then(function(result){
                        reload(result);
                        $scope.hasMetadataChanged = false;
                    });
                } else if (FolderModel.selectedType == 'folder') {
                    FolderService.saveFolder(FolderModel.selectedEntity, $scope).then(function(result){
                        reload(result);
                        $scope.hasMetadataChanged = false;
                    });
                } else if(FolderModel.selectedType == 'document') {
                    /** We currently have no rest service to update document metadata */
                    /*FolderService.saveDocument(FolderModel.selectedEntity, $scope).then(function(result){
                        reload(result);
                        $scope.hasMetadataChanged = false;
                    });*/
                }

            }
        };

        $scope.$watch('$destroy', function () {
            localStorageService.remove('newFolder');
            localStorageService.remove('newDocument');
            localStorageService.remove('updatedEntity');
        });

        function readFile(file) {
            var delay = new $q.defer();
            var reader = new FileReader();
            var content="";
            reader.onload = function(e) {
                content = reader.result;
                delay.resolve(content);
            };
            reader.readAsDataURL(file);

            return delay.promise;
        }

        function reload(result) {
            var delay = $q.defer();

            if (result.httpStatus == "201" || result.httpStatus == "204" || result.httpStatus == "200") {
                toaster.pop('info', result.message);
                //force reload
                DossierService.load(DossierModel.selectedDossier, $scope).then(
                    function (dossier) {
                        DossierModel.selectedDossier = dossier;
                        localStorageService.set('newFolder',$scope.newFolder);
                        localStorageService.set('newDocument',$scope.newDocument);
                        if (DossierModel.selectedDossier.identifier != $state.params.id){
                            $location.url("/dossier/"+ DossierModel.selectedDossier.identifier);
                        } else {
                            $state.reload();
                        }
                        angular.element('#addDialog').modal('hide');
                        delay.resolve();
                    },
                    function (e) {
                        delay.reject();
                    }
                );
            } else {
                toaster.pop('error', result.message);
                delay.resolve();
            }
            return delay.promise;
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
                classes: ["dossierBranch"],
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
                classes: ["folderBranch"],
                label: rootFolder.name,
                children: []
            };

            var documentArray = [];
            angular.forEach(rootFolder.documents, function (document) {
                var thisDocument = {
                    id: document.identifier,
                    obj: document,
                    type: "document",
                    classes: ["documentBranch"],
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

        /** Searches for an object in the treeview and selects the corresponding branch */
        function selectBranchByObj(inBranch, toFind){
            var children = tree.get_children(inBranch);
            angular.forEach(children, function (b) {
                if (b.obj.name == toFind.name) {
                    tree.expand_all();
                    tree.select_branch(b);
                } else {
                    selectBranchByObj(b, toFind);
                }
            });
        }

        //autoselect branch after page has rendered
        $scope.$evalAsync(function() {
            var newFolder = localStorageService.get('newFolder');
            var newDocument = localStorageService.get('newDocument');
            var updatedEntity = localStorageService.get('updatedEntity');
            if(newFolder == undefined && newDocument == undefined && updatedEntity == undefined){
                tree.select_first_branch();
            }
            if (newDocument || newFolder){
                //autoselect new branch
                selectBranchByObj(tree.get_first_branch(), (newFolder ? newFolder : newDocument));
            }
            if (updatedEntity){
                selectBranchByObj(tree.get_first_branch(), updatedEntity);
            }
            localStorageService.remove('newFolder');
            localStorageService.remove('newDocument');
            localStorageService.remove('updatedEntity');
        });

        function init() {
            var delay = $q.defer();
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
            delay.resolve();

            return delay.promise;
        }

        init();
    };

    app.register.controller('TreeController', ['$rootScope', '$scope', '$q', '$location', '$stateParams', '$state', '$translatePartialLoader', '$translate', 'localStorageService', 'CoreConfig', 'FolderModel', 'DossierModel', 'DossierService', 'FolderService', 'toaster', ctrl]);
});