/**
 * Created by axbsi01 on 01.07.2015.
 */

'use strict';

define([
    'app'
], function (app) {

    var ctrl = function ($scope, $state, $location) {

         $scope.back = function () {
             $location.url("/dossier");
         };

    };

    app.register.controller('FolderController', ['$scope', '$state', '$location', ctrl]);
});