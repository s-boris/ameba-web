'use strict';
/*
 * env.model.js
 * Environment model module
 */

/*jslint         browser : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 50,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true
 */

/*global $, openwms */
define(['angular'], function () {

    var module =
    {
        moduleName: "AMEBA",
        moduleVersion: "1.0.0",
        url: "stamplets_module",
        views: [
            {
                name: "Root",
                state: {
                    name: "project",
                    parent: "parent",
                    template: "views/tree.html",
                    header: {name: "header-view@", html: "views/partials/default-header.html", controller: ""},
                    content: {name: "content-view@parent.project", html: "views/Dossier.html", controller: ""}
                }
            },
            {
                name: "Dossier",
                url: "/dossier",
                state: {
                    name: "parent.dossier",
                    template: "views/tree.html",
                    header: {name: "header-view@", html: "views/partials/default-header.html"},
                    content: {name: "content-view@parent.dossier"}
                }
            }
        ]
    };

    var coreRtModel = angular.module('rtModelModule', []);
    coreRtModel.constant('RTConfig', module);
});

