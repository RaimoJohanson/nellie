var API_URL = "https://nellie-api-raimoj.c9users.io/api";
var APP_LANG = 'eng'; //'et'
var App = angular.module('Dev', []);
App.controller("main", function($rootScope, $scope, $http, $timeout) {
    $rootScope.teachingForm = { category: '' }

})
App.controller("searchExistingFault", function($rootScope, $scope, $http, $timeout) {
    /*
    if ($rootScope.teachingForm.fault.label_value.length > 3) $scope.checkExistingFaults();
    $scope.component = {
        body: [{ id: 1, value: 'Air conditioning' }, { id: 2, value: 'Air bag & SRS' }, { id: 3, value: 'Interior ventilation' }],
        chassis: [{ id: 3, value: 'Brakes' }, { id: 4, value: 'Steering' }, { id: 5, value: 'Suspension' }, { id: 5, value: 'Wheels' }],
        powertrain: [{ id: 6, value: 'Engine' }, { id: 7, value: 'Transmission' }],
        electrical: [{ id: 8, value: 'Infotainment system' }]

    };
    */

    $scope.loading = false;
    $scope.showMore = function(id) {
        $scope.toggleLabel === id ? $scope.toggleLabel = undefined : $scope.toggleLabel = id;
    };
    $scope.checkExistingFaults = function() {
        if ($rootScope.teachingForm.fault.label_value.length < 4) return;
        $scope.loading = true;

        $http.get(API_URL + '/label?name=' + $rootScope.teachingForm.fault.label_value).then(response => {
            if ($scope.err) $scope.err = null;
            $scope.searchResults = response.data.list;
            $scope.loading = false;

        }).catch(err => {
            $scope.err = err.data;
        });
    }
    $scope.proceed = function() {
        if (!$rootScope.teachingForm.fault.label_value) return $scope.err = 'Lisa vea nimetus enne';
        $scope.err = $rootScope.teachingForm;
        var showError = setTimeout(() => {
            $scope.err = null;
            $scope.$apply();
        }, 2500)

    }
    $scope.clarify = function(fault) {
        //fault = {id: id, value: ''}
        if (!fault.id) return;

        $rootScope.teachingForm.fault = {
            label: fault.id,
            label_value: fault.value
        };

        $rootScope.view = "teaching";
    }
});
