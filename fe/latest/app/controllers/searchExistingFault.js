App.controller("searchExistingFault", function($rootScope, $scope, $http, $timeout) {
    $scope.toggleLabel = -1;
    $scope.showMore = function(id) {
        $scope.toggleLabel === id ? $scope.toggleLabel = undefined : $scope.toggleLabel = id;
    };
    $scope.checkExistingFaults = function() {
        if ($rootScope.teachingForm.fault.label_value.length < 3) return $rootScope.searchResults = [];

        $http.get(API_URL + '/label?name=' + $rootScope.teachingForm.fault.label_value).then(response => {
            $rootScope.searchResults = response.data.list;
        }).catch(err => {
            $scope.err = err;
        });
    }
    $scope.proceed = function() {
        if (!$rootScope.teachingForm.fault.label_value) return $scope.err = 'Lisa vea nimetus enne';

        $rootScope.view = "teaching";
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
