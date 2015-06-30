'use strict';

define(['app'], function (app) {

    var srv = function () {

        this.selectedDossier = undefined;

        this.setSelectedDossier = function (dossier) {
            this.selectedDossier = dossier;
        };
    };

    app.service("FolderModel", [srv]);

});