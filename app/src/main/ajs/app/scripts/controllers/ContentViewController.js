'use strict';

define([
    'app',
    'models/FolderModel',
    'services/CoreService',
    'material',
    'ripples'
], function (app) {

    var ctrl = function ($rootScope, $scope, $state, $stateParams, $q, CoreConfig, FolderModel, FolderService) {

        $scope.pageNum = 1;
        $scope.pdfDoc = undefined;
        var scale = 1.38;

        $rootScope.$on(CoreConfig.events.TREE_CLICKED, function (event, next, current) {
            var canvas = getCanvas();
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            $scope.pageNum = 1; //reset pagenum
            loadDocument(next.identifier);
        });

        function loadDocument (id) {
            angular.element(".pdf-controls").css('display', 'none');
            //start loading spinner
            angular.element("#contentSpinner").show();
            FolderService.getDocument(id, $scope).then(
                function () {
                    var type = FolderModel.selectedEntity.mimeType;
                    if (type.indexOf('image') == 0) {
                        displayImage(type);
                    } else if (type.indexOf('application/pdf') == 0) {
                        initPDFViewer();
                        angular.element(".pdf-controls").show();
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

            var canvas = getCanvas();
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            //start loading spinner
            angular.element("#contentSpinner").show();
            renderPage($scope.pageNum).then(function(){
                //stop loading spinner
                angular.element("#contentSpinner").css('display', 'none');
            });

        };

        $scope.nextPage = function () {
            if ($scope.pageNum >= $scope.pdfDoc.numPages) {
                return;
            }
            $scope.pageNum++;

            var canvas = getCanvas();
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            //start loading spinner
            angular.element("#contentSpinner").show();
            renderPage($scope.pageNum).then(function(){
                //stop loading spinner
                angular.element("#contentSpinner").css('display', 'none');
            });
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
                $scope.pdfDoc = pdfDoc_;
                document.getElementById('page_count').innerText = $scope.pdfDoc.numPages;
                // Initial/first page rendering
                renderPage($scope.pageNum);
            });
        }


        function renderPage(num) {
            var delay = $q.defer();

            document.getElementById('page_num').innerText = $scope.pageNum;

            $scope.pdfDoc.getPage(num).then(function (page) {

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
                    delay.resolve();
                });
            });

            return delay.promise;
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

    app.register.controller('ContentViewController', ['$rootScope', '$scope', '$state', '$stateParams', '$q', 'CoreConfig', 'FolderModel', 'FolderService', ctrl]);
});

