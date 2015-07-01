'use strict';

define([
    'app',
    'models/DossierModel',
    'models/FolderModel',
    'services/CoreService',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($scope, $translatePartialLoader, $translate, $location, $state, $stateParams, DossierModel, FolderModel, DossierService, FolderService) {

        $translatePartialLoader.addPart('folder');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.folderModel = FolderModel;

        $scope.back = function () {
            $state.go("parent.dossier");
        };

        $scope.selectTreeElement = function (branch) {
            var canvas = getCanvas();
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            $scope.folderModel.selectedEntity = branch.obj;
            $scope.folderModel.selectedType = branch.type;
            if(FolderModel.selectedType == 'document'){
                $scope.loadDocument(FolderModel.selectedEntity.identifier);
            }
        };

        $scope.loadDocument = function (id) {
            //start loading spinner
            angular.element("#contentSpinner").show();

            FolderService.getDocument(id, $scope).then(
                function () {
                    var type = FolderModel.selectedEntity.mimeType;
                    if (type.indexOf('image') == 0) {

                        displayImage(type);
                    } else if (type.indexOf('application/pdf') == 0) {
                        renderPDFInViewer();
                    }
                    //stop loading spinner
                    angular.element("#contentSpinner").css('display', 'none');
                },
                function (e) {
                    console.log(e);
                }
            );
        };

        function renderPDFInViewer() {
            //convert base64
            var base64 = FolderModel.document;
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }

            PDFJS.getDocument(array).then(function (pdf) {
                pdf.getPage(1).then(function (page) {
                    var scale = 1.5;
                    var viewport = page.getViewport(scale);
                    //
                    // Prepare canvas using PDF page dimensions
                    //
                    var canvas = getCanvas();
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    //
                    // Render PDF page into canvas context
                    //
                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    page.render(renderContext);
                });
            });
        }

        function displayImage(type) {
            var image = new Image();
            image.onload = function () {
                getCanvas().getContext("2d").drawImage(image, 10, 10, 150, 180);
            };
            image.src = "data:" + type + ";base64," + FolderModel.document;
        }

        function getCanvas() {
            return document.getElementById('viewer-canvas');
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

    app.register.controller('FolderController', ['$scope', '$translatePartialLoader', '$translate', '$location', '$state', '$stateParams', 'DossierModel', 'FolderModel', 'DossierService', 'FolderService', ctrl]);
});

