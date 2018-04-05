App.controller("admin", function($rootScope, $scope, $http, $timeout) {

    $http.get(API_URL + '/admin').then(response => {

        $scope.data = response.data;
        $scope.keys = Object.keys(response.data);
        $scope.selectedTab = $scope.keys[3]; //default view

    }).catch(err => {
        $scope.err = err;
    });

    $scope.selectTab = (key) => {
        $scope.selectedTab = key;

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
});
