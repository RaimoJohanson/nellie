App.controller("teaching", function($rootScope, $scope, $http, $timeout) {

    //console.log($rootScope.teachingForm);
    //console.log($rootScope.sessionHistory.interactions);
    $scope.validate = function(value) {
        if (value.charAt(value.length - 1) != '?') return false;
        if (!value.includes(' ')) return false;
        if (value.length < 3) return false;
        return true;
    }

    $scope.dynamicInput = function(action, id) {
        let arr = $rootScope.teachingForm.newQuestions;
        let arrLength = $rootScope.teachingForm.newQuestions.length;
        switch (action) {
            case 'change':
                let add = 1;
                for (let i = 0; i < arrLength; i++) {
                    if (!arr[i].value && arr[i]._id != id) add = 0;
                }
                if (arrLength < 2) $rootScope.teachingForm.newQuestions.push({ _id: id + 1, value: '' });
                else if (add) $rootScope.teachingForm.newQuestions.push({ _id: id + 1, value: '' });
                break;
            case 'blur':
                for (let i = 0; i < $rootScope.teachingForm.newQuestions.length; i++) {

                    if ($rootScope.teachingForm.newQuestions[i]._id === id)
                        if (!arr[i].value && arrLength > 1 && i != arrLength - 1) $rootScope.teachingForm.newQuestions.splice(i, 1);
                }

                break;
            case 'remove':

                for (let i = 0; i < $rootScope.teachingForm.newQuestions.length; i++) {
                    if (arr[i]._id === id && arrLength > 1) {
                        $rootScope.teachingForm.newQuestions.splice(i, 1);
                    }
                }
                break;
        }

    };
    $scope.submitForm = function() {
        /*
         * @ $scope.teachingForm = {fault: {id, value}, newQuestions: [{_id,value},{...}]}
         *
         * 
         */
        $scope.teachNellie = false;
        let uploadForm = {
            label: $scope.teachingForm.fault,
            newFeatures: [],
            oldFeatures: []
        };
        if ($rootScope.sessionHistory) {
            $rootScope.sessionHistory.interactions.forEach(record => {
                if (record.decision == 1) uploadForm.oldFeatures.push(record.id);
            });
        }
        $rootScope.teachingForm.newQuestions.forEach(feature => {
            if (feature.value) uploadForm.newFeatures.push(feature.value);
        });
        //console.log(uploadForm)

        uploadForm.session_id = $rootScope.session_id;

        $http({
            url: API_URL + '/data',
            method: "post",
            data: uploadForm
        }).then(function(response) {

            $rootScope.view = 'thanks';

        }).catch(err => {
            $scope.alertBox(err.data);
        });
    };
});
