'use strict';

define(['angular'], function () {
    var coreEnvModel = angular.module('coreEnvModel', []);

    var config = {

        env: {
            "DEVMODE": false,
			"backendUrl": 'https://stampback.cfapps.io',
//            "backendUrl": 'http://localhost:8280',
//			"backendUrl" : '${backend.url}',
            "buildNumber": '${build.number}',
            "buildDate": '${build.date}'
        },

        const: {
            AUTH_TOKEN: 'Auth-Token',
            TENANT_ID: 'TenantId',
            USER_PROFILE: 'UserProfile',
            USER_LANG: 'Language'
        },

        events: {
            APP_LOGIN: 'CORE_APP_LOGIN',
            APP_LOGOUT: 'CORE_APP_LOGOUT',
            RETRIEVED_TOKEN: 'CORE_RETRIEVED_TOKEN',
            SUCCESSFULLY_LOGGED_IN: 'SUCCESSFULLY_LOGGED_IN',
            INVALID_CREDENTIALS: 'CORE_INVALID_CREDENTIALS'
        }
    };

    coreEnvModel.constant('CoreConfig', config);
});
