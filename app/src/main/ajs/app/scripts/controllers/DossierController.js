'use strict';

define([
    'app',
    'models/DossierModel',
    'services/DossierService',
    'services/CoreService',
    'material',
    'ripples'
], function (app) {

    var WizzardController = function ($scope, $modalInstance, $translate, DialogService, DossierService, DossierModel, toaster) {
        $scope.modalOptions = {
            actionButtonText: '',
            actionDisabled: false,
            closeButtonText: '',
            headerText: '',
            template: 'views/partials/dossierAddPartial.html',
            messageTxt: '',
            closeAfterAction: true,
            showCloseButton: true,
            action: 'page1',
            id: 'addDossier',
            data: {
                dossier: DossierModel.newDossier
            }
        };

        $translate('DOSSIER.ADDDLG.ACTION_BTN').then(function (t) {
            $scope.modalOptions.actionButtonText = t;
        });
        $translate('DOSSIER.ADDDLG.CLOSE_BTN').then(function (t) {
            $scope.modalOptions.closeButtonText = t;
        });
        $translate('DOSSIER.ADDDLG.HEADER_TXT').then(function (t) {
            $scope.modalOptions.headerText = t;
        });

        $scope.modalOptions.callback = function (action) {
            if (action === 'page1') {
                // Do not pass the complete Restaurant structure to the backend due to mapping problems, only the id
                DossierService.create($scope.modalOptions.data.dossier, $scope).then(
                    function () {
                        $translate('DOSSIER.ADD_SUCCESS').then(function (t) {
                            toaster.pop('info', t);
                        });
                        DossierModel.newDossier = {};
                        $scope.modalOptions.close();
                    },
                    function (e) {
                        $translate('DOSSIER.ADD_ERROR', {'error': e.message}).then(function (t) {
                            toaster.pop('info', t);
                        });
                    }
                );
            } else {
                throw Error("Page " + action + " not found");
            }
        };

        $scope.modalOptions.close = function (result) {
            $modalInstance.close();
            DialogService.modalOpened = false;
        };
    };

    var ctrl = function ($scope, $translatePartialLoader, $translate, $location, toaster, DossierModel, CoreService, DossierService, DialogService) {

        $translatePartialLoader.addPart('dossier');
        $translate.refresh();
        $translate.use($scope.getUserLang());

        /** Model binding for view. */
        $scope.dossierModel = DossierModel;

        function reloadInternal() {
            DossierService.reload($scope);
        }

        /**  */
        $scope.reload = function () {
            reloadInternal();
        };

        $scope.add = function() {
            DialogService.showModal({controller: WizzardController}).then(
                function () {
                    reloadInternal(true);
                    DialogService.modalOpened = false;
                },
                function () {
                    DialogService.modalOpened = false;
                }
            );
        };

        $scope.select = function(dossier) {
            DossierModel.setSelectedDossier(dossier);
            $location.url('/dossier/'+dossier.identifier);
        };

        function init() {
            $.material.init();
            reloadInternal();
        }
        init();
    };

    app.register.controller('DossierController', ['$scope', '$translatePartialLoader', '$translate', '$location', 'toaster', 'DossierModel', 'CoreService', 'DossierService', 'DialogService', ctrl]);
});

