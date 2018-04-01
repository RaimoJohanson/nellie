var API_URL = "https://nellie-api-raimoj.c9users.io/api";
var APP_LANG = 'eng'; //'et'

var App = angular.module('App', []);

App.controller("main", function($rootScope, $scope, $http, $timeout) {

    $scope.resetApplication = function(args) {
        $rootScope.sessionUploaded = false;
        $rootScope.teachingForm = {
            newQuestions: [{ _id: 0, value: '' }]
        };
        $rootScope.searchResults = [];

        $rootScope.loading = true;
        var url = API_URL + '/data';

        if (args) { //expect csv
            if (args.yes && args.no) url += '?yes=' + args.yes + '&no=' + args.no;
            else if (args.yes) url += '?yes=' + args.yes;
            else url += '?no=' + args.yes;
        }
        $http.get(url).then(function(response) {
            if (!response.data.list.length) return $rootScope.view = "teaching";


            $rootScope.trainingData = response.data.list;
            $rootScope.session_id = response.data.session_id;

            $rootScope.view = "asking";

        }).catch(err => {
            $scope.currentQuestion = err;
        });
    };

    $scope.answerTranslate = function(answer) {
        var book = {
            'eng': {
                1: 'Yes',
                2: 'Don\'t know',
                0: 'No'
            },
            'et': {
                1: 'Jah',
                2: 'Ei tea',
                0: 'Ei'
            }
        };
        return book[APP_LANG][answer];
    };
    $scope.uploadSession = function(data) {

        if (!$rootScope.sessionUploaded) {
            $rootScope.sessionUploaded = true;
            $http({
                url: API_URL + '/session/' + $rootScope.session_id,
                method: "put",
                data: data
            });
        }
        return;
    };
    $scope.alertBox = function(message) {

        if (!$scope.err) {
            $scope.err = message;

            if ($scope.formErrorDebounce) {
                clearTimeout($scope.formErrorDebounce);
            }

            $scope.formErrorDebounce = setTimeout(function() {
                $scope.err = false;
                $scope.$apply();
            }, 3000);
        }

    };
    $rootScope.minHitCount = 3; //How many questions are answered "yes" to display results
    $rootScope.minimalGain = 0.000;

    $scope.resetApplication(); //Start asking
});
