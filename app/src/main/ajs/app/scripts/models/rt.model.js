'use strict';
/*
 * env.model.js
 * Environment model module
 */

define(['angular'], function () {

    var module =
    {
        moduleName: "AMEBA",
        moduleVersion: "1.0.0",
        url: "ameba_module",
        views: [
            {
                name: "Dossier",
                url: "/dossier",
                state: {
                    name: "parent.dossier",
                    template: "views/no-tree.html",
                    header: {name: "header-view@", html: "views/partials/dossier-header.html"},
                    content: {name: "content-view@parent.dossier"}
                }
            },
            {
                name: "Folder",
                url: "/dossier/{id}",
                state: {
                    name: "parent.folder",
                    template: "views/tree.html",
                    header: {name: "header-view@", html: "views/partials/folder-header.html"},
                    menu: {name: "menu-view@parent.folder", html: "views/Folder.html", controller: "TreeController"},
                    content: {name: "content-view@parent.folder", html: "views/ContentViewer.html", controller: "ContentViewController"}
                }
            }
        ]
    };

    var coreRtModel = angular.module('rtModelModule', []);
    coreRtModel.constant('RTConfig', module);
});

