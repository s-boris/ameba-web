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
        callbackError(xhr.response);
      };

      xhr.addEventListener("error", function (e) {
        var response = {
          message: 'The resource with path ' + path + ' could not be loaded',
          messageKey: 'unknown.resource',
          httpStatus: '404'
        };
        console.log(xhr.statusText);
        callbackError(response);
      }, false);

      xhr.open(method, path, true);
      xhr.setRequestHeader('Authorization', 'Basic '+ btoa('sva01:P!lot2014SV@'));
      xhr.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
//      xhr.withCredentials = true;
      xhr.send();
    };

    httpGetRequest("http://127.0.0.1:8080/dossiers", "GET",
        function(response) {
          console.log(response);
        }, function(response) {
          console.log(response);
        }
    );
  });
