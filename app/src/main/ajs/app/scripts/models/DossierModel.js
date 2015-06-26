'use strict';

define(['app'], function (app) {

    var srv = function () {

        this.dossiers = [];
        this.selectedDossier = undefined;

        this.setDossiers = function (dossiers) {
            this.dossiers = dossiers;
        };
        this.setSelectedDossier = function (dossier) {
            this.selectedDossier = dossier;
        };
    };

    app.service("DossierModel", [srv]);

});