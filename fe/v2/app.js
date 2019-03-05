var API_URL = "https://nellie-api-raimoj.c9users.io/api";
var APP_LANG = 'eng'; //'et'

var App = angular.module('App', []);
App.directive("href", function($rootScope, $timeout) {
    return {
        restrict: "A",
        link: function($scope, $element, $attr, ) {

            $element.bind("click", function(e) {
                e.preventDefault();
                $rootScope.view = $attr.href;
                $timeout(function() {
                    $rootScope.$apply();
                }, 0);
            });
        }
    }
});


App.controller("main", function($rootScope, $scope, $http, $timeout) {


    $scope.resetApplication = function(args) {

        $rootScope.teachingForm = {
            fault: {},
            newQuestions: [{ _id: 0, value: '' }]
        };

        $scope.loading = true;

        let url = API_URL + '/data';

        if (args) { //expect csv
            if (args.yes && args.no) url += '?yes=' + args.yes + '&no=' + args.no;
            else if (args.yes) url += '?yes=' + args.yes;
            else url += '?no=' + args.yes;
        }
        $http.get(url).then(function(response) {
            if (!response.data.list.length) return $rootScope.view = "teaching";
            $rootScope.trainingData = response.data.list;
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


    $rootScope.minimalGain = 0.000;

    $scope.resetApplication(); //Start asking
});

App.controller("searchExistingFault", function($rootScope, $scope, $http, $timeout) {
    $scope.loading = false;
    $scope.search = {};

    $scope.checkExistingFaults = function() {
        if ($rootScope.teachingForm.fault.label_value.length < 3) return;

        $scope.loading = true;

        $http.get(API_URL + '/label?name=' + $rootScope.teachingForm.fault.label_value).then(response => {

            $scope.searchResults = response.data.list;
            $scope.loading = false;

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

App.controller("teaching", function($rootScope, $scope, $http, $timeout) {

    //console.log($rootScope.teachingForm);
    //console.log($rootScope.sessionHistory.interactions);

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

        if (!uploadForm.newFeatures.length) return $scope.err = "Add at least one question";
        if (!uploadForm.label.label_value) return $scope.err = "Fault title is missing";
        $scope.err = false;
        $http({
            url: API_URL + '/data',
            method: "post",
            data: uploadForm
        }).then(function(response) {

            $rootScope.view = 'thanks';

        }).catch(err => {

            $scope.err = err;
        });
    };
});

App.controller("results", function($rootScope, $scope, $http, $timeout) {

    $scope.busy = true;

    $scope.faults = sortSolutions($rootScope.trainingData); //sort by percentage

    //if (!$scope.faults.answer.length) $rootScope.view = "firstLesson";

    $http.get(API_URL + '/label?id=' + $scope.faults.unique_ids.join(',')).then(response => {

        response.data.list.forEach(subject => {
            $scope.faults.answer.forEach(result => {
                if (result.label === subject.id) result.label_value = subject.value;
            });
        });

        $scope.can_clarify = true; //false if suspicious behaviour is detected
        $scope.busy = false;


    }).catch(err => {
        $scope.err = err;
    });


    function sortSolutions(list) {
        let result = {
            unique_ids: [],
            answer: []
        };

        list.forEach(subject => {
            let duplicate = result.answer.some(e => e.label === subject.label);
            let occurance = list.filter(e => e.label === subject.label).length;
            if (!duplicate) {
                delete subject.features; //features vary on different instances
                subject.probability = parseFloat(occurance / list.length).toFixed(2) / 1;
                result.unique_ids.push(subject.label);
                result.answer.push(subject);
            }
        });
        result.answer = result.answer.sort(function(a, b) { return b.probability - a.probability });
        return result;
    }

    $scope.clarify = function(fault) {
        //fault = {label: id, label_value: ''}

        if (!fault.label || $scope.can_clarify === false) return;

        $rootScope.teachingForm.fault = fault;

        //$rootScope.view = "extraQuestions";
        $rootScope.view = "teaching";
    };
});

App.controller("asking", function($rootScope, $scope, $http, $timeout) {
    $rootScope.sessionHistory = {
        hit_count: 0,
        interactions: []
    };
    $scope.busy = true;

    if (!$rootScope.sessionHistory.interactions.length) {
        $scope.currentQuestion = checkHistory(getFeatures($rootScope.trainingData), $rootScope.sessionHistory.interactions); //initialize asking...
        //$scope.currentQuestion = getFeatures($rootScope.trainingData)[0];
        displayQuestion($scope.currentQuestion);
    }

    $scope.userInteraction = function(action) {
        if ($scope.busy) return;
        else $scope.busy = true;

        $scope.currentQuestion.elapsedTime = Date.now() - $scope.time;

        switch (action) {
            case 'yes':
                $rootScope.sessionHistory.hit_count++;
                $scope.currentQuestion.decision = 1;
                break;
            case 'no':
                $scope.currentQuestion.decision = 0;
                break;
            case 'unknown':
                $scope.currentQuestion.decision = 2;
                break;
        }
        if ($scope.currentQuestion.decision != 2) $rootScope.trainingData = trim($rootScope.trainingData, $scope.currentQuestion.id, $scope.currentQuestion.decision);

        $rootScope.sessionHistory.interactions.push($scope.currentQuestion);

        $scope.currentQuestion = checkHistory(getFeatures($rootScope.trainingData), $rootScope.sessionHistory.interactions);

        if ($scope.currentQuestion.gain > $rootScope.minimalGain) displayQuestion($scope.currentQuestion);

        else if ($scope.currentQuestion.id && $rootScope.sessionHistory.hit_count < 3) {
            //min $rootScope.sessionHistory.hit_count = 3
            displayQuestion($scope.currentQuestion);
        }
        else $rootScope.view = "results";

    };

    function displayQuestion() {

        $http.get(API_URL + '/feature?id=' + $scope.currentQuestion.id).then(response => {

            $scope.currentQuestion.value = response.data.value;

            $scope.busy = false; //buttons are active

            $scope.loading = false; //stop loading animation

            $scope.time = Date.now();

        }).catch(err => {
            $scope.currentQuestion.value = err;
        });
    }

    function checkHistory(features, history) {
        /*     @history = [{id: Number, value: String}]
         *     @features = [{id: 1, gain: "1.0000"}] //SORTED ORDER
         */
        if (history.length < 1) return features[0];

        for (let i = 0; i < features.length; i++) {
            let flag = 1;
            for (let x = 0; x < history.length; x++) {
                if (features[i].id == history[x].id) {
                    flag = 0;
                    break;
                }
            }
            if (flag) return features[i];
        }
        return { id: false, gain: $rootScope.minimalGain };
    };

    function trim(data, feature_id, decision) {
        let output = [];

        data.forEach(subject => {
            switch (decision) {
                case 1:
                    if (subject.features.indexOf(Number(feature_id)) > -1) output.push(subject);
                    break;
                case 0:
                    if (subject.features.indexOf(Number(feature_id)) < 0) output.push(subject);
                    break;
                default:
                    console.log('Exception @ trimming - feature ID: %s, decision: %s', feature_id, decision);
            }
        });

        return output;
    };

    function getFeatures(data) {

        function countData(dataset) {
            let output = {
                total: 0,
                labels: {},
                features: {}
            };
            dataset.forEach(subject => {
                output.total++;
                if (output.labels[subject.label]) output.labels[subject.label]++;
                else output.labels[subject.label] = 1;

                for (var featureId of subject.features) {
                    if (output.features[featureId]) output.features[featureId]++;
                    else output.features[featureId] = 1;
                }
            });
            return output;
        }

        function countFeature(dataset, id) {

            let sides = {
                leftCount: {
                    total: 0,
                    labels: {},
                    features: {}
                },
                rightCount: {
                    total: 0,
                    labels: {},
                    features: {}
                }
            };
            dataset.forEach(subject => {
                let side;
                subject.features.indexOf(Number(id)) > -1 ? side = 'leftCount' : side = 'rightCount';

                sides[side].total++;
                if (sides[side].labels[subject.label]) sides[side].labels[subject.label]++;
                else sides[side].labels[subject.label] = 1;
                for (let featureId of subject.features) {
                    if (sides[side].features[featureId]) sides[side].features[featureId]++;
                    else sides[side].features[featureId] = 1;
                }
            });
            return sides;
        }

        function calculateEntropy(count) {
            //EQUATION: -(x / (x+y)) * log2(x / (x+y)) - (y / (x+y)) * log2(y / (x+y));
            let result = -1;
            for (let id in count.labels) {
                let i = Number(count.labels[id]);

                if (result === -1) result *= (i / count.total) * Math.log2(i / count.total);
                else result -= (i / count.total) * Math.log2(i / count.total);
            }
            return parseFloat(result).toFixed(4);
        }

        let count = countData(data);

        //console.log('Count before:');
        //console.log(count);

        let entropyBefore = calculateEntropy(count);
        //console.log('Entropy before: %s', entropyBefore);
        let informationGain = {};

        for (let id in count.features) {

            let featureCount = countFeature(data, id);

            let entropyLeft = calculateEntropy(featureCount.leftCount);

            let entropyRight = calculateEntropy(featureCount.rightCount);

            let entropyAfter = parseFloat(featureCount.leftCount.total / count.total * entropyLeft + featureCount.rightCount.total / count.total * entropyRight).toFixed(4);
            //console.log('Entropy after: %s', entropyAfter);

            let iGain = entropyBefore - entropyAfter;
            informationGain[id] = parseFloat(iGain).toFixed(4);

        }
        //console.log('Infromation Gain:', informationGain);

        let gains = [];
        for (let id in informationGain) {
            gains.push({ id: Number(id), gain: informationGain[id] });

        }
        //console.log('Sorted order of features based on info gain:');
        //console.log(gains.sort(function(a, b) { return b.gain - a.gain }));
        return gains.sort(function(a, b) { return b.gain - a.gain });
    }
});
