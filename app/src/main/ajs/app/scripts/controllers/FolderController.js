/**
 * Created by axbsi01 on 01.07.2015.
 */

'use strict';

define([
    'app'
], function (app) {

    var ctrl = function ($scope, $state) {

         $scope.back = function () {
            $state.go("parent.dossier");
         };

    };

    app.register.controller('FolderController', ['$scope', '$state', ctrl]);
});