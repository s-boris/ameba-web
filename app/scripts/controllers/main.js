'use strict';

angular.module('amebaWebApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var httpGetRequest;
    httpGetRequest = function (path, method, callbackSuccess, callbackError) {
      var xhr = new XMLHttpRequest();


      xhr.onload = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 0) {
            callbackSuccess(xhr.responseText);
            return;
          }
        }
        var response = {
          message: 'The resource with path ' + path + ' could not be loaded',
          messageKey: 'unknown.resource',
          httpStatus: '404'
        };

        console.log(xhr.statusText);
        callbackError(response);
      };

      xhr.onerror = function (e) {
        var response = {
          message: 'The resource with path ' + path + ' could not be loaded',
          messageKey: 'unknown.resource',
          httpStatus: '404'
        };
        console.log(xhr.statusText);
        callbackError(response);
      };

      xhr.open(method, path, true);
      //xhr.setRequestHeader('Authorization', 'Basic '+ btoa('sva01:P!lot2014SV@'));
      //xhr.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
      xhr.withCredentials = true;
      xhr.send();

    };
    httpGetRequest("https://www.google.ch/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=test", "GET", function(response) {
      console.log(response);
    }, function(response) {
      console.log("Error");
    });
  });
