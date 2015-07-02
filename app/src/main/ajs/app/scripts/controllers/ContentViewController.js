'use strict';

define([
    'app',
    'models/FolderModel',
    'services/CoreService',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($rootScope, $scope, $state, $stateParams, CoreConfig, FolderModel, FolderService) {

        $scope.pageNum = 1;
        var pdfDoc,
            pageRendering = false,
            pageNumPending,
            scale = 1.5;

        $rootScope.$on(CoreConfig.events.TREE_CLICKED, function (event, next, current) {
            var canvas = getCanvas();
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            loadDocument(next.identifier);
        });

        function loadDocument (id) {
            //start loading spinner
            angular.element("#contentSpinner").show();

            FolderService.getDocument(id, $scope).then(
                function () {
                    var type = FolderModel.selectedEntity.mimeType;
                    if (type.indexOf('image') == 0) {
                        displayImage(type);
                    } else if (type.indexOf('application/pdf') == 0) {
                        initPDFViewer();
                    }
                    //stop loading spinner
                    angular.element("#contentSpinner").css('display', 'none');
                },
                function (e) {
                    console.log(e);
                }
            );
        }


        /******************************
         * PDF Viewer functions.
         ******************************/

        $scope.prevPage = function () {
            if ($scope.pageNum <= 1) {
                return;
            }
            $scope.pageNum--;
            queueRenderPage($scope.pageNum);
        };

        $scope.nextPage = function () {
            if ($scope.pageNum >= pdfDoc.numPages) {
                return;
            }
            $scope.pageNum++;
            queueRenderPage($scope.pageNum);
        };


        function initPDFViewer() {
            //convert base64
            var base64 = FolderModel.document;
            var raw = window.atob(base64);
            var rawLength = raw.length;
            var array = new Uint8Array(new ArrayBuffer(rawLength));

            for (var i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }

            PDFJS.getDocument(array).then(function (pdfDoc_) {
                pdfDoc = pdfDoc_;
                document.getElementById('page_count').textContent = pdfDoc.numPages;

                // Initial/first page rendering
                renderPage($scope.pageNum);
            });
        }

        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        function renderPage(num) {
            pageRendering = true;

            pdfDoc.getPage(num).then(function (page) {

                // Prepare canvas using PDF page dimensions
                var canvas = getCanvas();
                var context = canvas.getContext('2d');
                var viewport = page.getViewport(scale);
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                var renderTask = page.render(renderContext);

                // Wait for rendering to finish
                renderTask.promise.then(function () {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        // New page rendering is pending
                        renderPDFInViewer(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });
        }

        /*******************************
         ******************************/


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



        function init() {
            $.material.init();
        }

        init();
    };

    app.register.controller('ContentViewController', ['$rootScope', '$scope', '$state', '$stateParams', 'CoreConfig', 'FolderModel', 'FolderService', ctrl]);
});

