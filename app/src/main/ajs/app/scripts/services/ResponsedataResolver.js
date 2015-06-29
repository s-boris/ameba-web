'use strict';
define([
    'app'
], function (app) {

    var srv = function () {

        var result = {};

        result.resolveMultiple = function (data, delay) {
            if (data === undefined || data.obj === undefined) {
                delay.reject(new Error("Expected multiple response but was incomplete"));
            } else {
                delay.resolve(data.obj);
            }
        };

        result.resolveSingle = function (data, delay) {
            if (data === undefined || data.obj === undefined) {
                delay.reject(new Error("Expected single response but was incomplete"));
            } else {
                delay.resolve(data.obj[0]);
            }
        };

        result.resolveIsCreated = function (data, delay) {
            if (data && data.httpStatus == '201') {
                delay.resolve();
            }
            delay.reject();
        };

        return result;
    };

    app.factory('ResponsedataResolver', [srv]);

});
