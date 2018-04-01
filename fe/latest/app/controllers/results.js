App.controller("results", function($rootScope, $scope, $http, $timeout) {
    $scope.faults = sortSolutions($rootScope.trainingData); //sort by percentage

    $scope.uploadSession({
        sessionHistory: $rootScope.sessionHistory,
        results: $scope.faults.answer
    });

    if ($rootScope.sessionHistory.hit_count >= $rootScope.minHitCount && $scope.faults.answer.length > 0) {

        $scope.displayResults = true;
        if (!$scope.faults.answer[0].label_value) {
            $scope.busy = true;
            $http.get(API_URL + '/label?id=' + $scope.faults.unique_ids.join(',')).then(response => {
                response.data.list.forEach(subject => {
                    $scope.faults.answer.forEach(fault => {
                        if (fault.label === subject.id) fault.label_value = subject.value;
                    });
                });
                $scope.busy = false;
            }).catch(err => {
                $scope.err = err;
                $scope.busy = false;
            });
        }
    }
    else $scope.displayResults = false;

    function sortSolutions(list) {
        let result = {
            unique_ids: [],
            answer: []
        };
        let fitness_sum = 0;
        list.forEach(subject => {
            fitness_sum += subject.fitness;

        });

        list.forEach(subject => {
            let duplicate = result.answer.some(e => e.label === subject.label);
            let occurance = list.filter(e => e.label === subject.label).length;
            if (!duplicate) {
                delete subject.features; //features vary on different instances
                //subject.probability = parseFloat(occurance / list.length).toFixed(2) / 1;

                subject.probability = parseFloat(subject.fitness / fitness_sum).toFixed(2) / 1;

                if (subject.probability > 0) {
                    result.unique_ids.push(subject.label);
                    result.answer.push(subject);
                }
            }
            else {
                result.answer.forEach(record => {
                    if (record.label === subject.label) {

                        record.fitness += subject.fitness;
                        record.probability = parseFloat(record.fitness / fitness_sum).toFixed(2) / 1;
                    }
                });
            }
        });
        result.answer = result.answer.sort(function(a, b) { return b.probability - a.probability });
        return result;
    }
    $scope.endorse = function(fault) {
        //fault = {label: id, label_value: 'asdasd'}

        if (!fault.label) return;
        let uploadForm = {
            label: { label: fault.label, label_value: fault.label_value },
            oldFeatures: [],
            session_id: $rootScope.session_id
        };

        $rootScope.sessionHistory.interactions.forEach(r => {
            if (r.decision === 1) uploadForm.oldFeatures.push(r.id);
        });

        $http({
            url: API_URL + '/endorse',
            method: "post",
            data: uploadForm
        }).then(function(response) {
            // console.log(fault.label);
            $scope.endorsed = fault.label;

        }).catch(err => {

            $scope.err = err;
        });
    };
    $scope.showMore = function(id) {
        $scope.toggleLabel === id ? $scope.toggleLabel = undefined : $scope.toggleLabel = id;
    };
});
