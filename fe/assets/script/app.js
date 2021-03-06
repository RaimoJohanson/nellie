var app = angular.module('App', []);

app.controller('nellie', function($scope, $http, $timeout) {
    const API_URL = "https://nellie-api-raimoj.c9users.io/api";
    let bestFeature;
    let minimalGain = 0.000;
    $scope.sessionHistory;


    $scope.answerTranslate = function(answer) {
        let translation;
        switch (answer) {
            case 1:
                translation = 'Jah';
                break;
            case 0:
                translation = 'Ei tea';
                break;
            case -1:
                translation = 'Ei';
                break;
        }
        return translation;
    };
    $scope.dynamicInput = function(action, id) {
        let arr = $scope.teachingForm.newQuestions;
        let arrLength = $scope.teachingForm.newQuestions.length;
        switch (action) {
            case 'change':
                let add = 1;
                for (let i = 0; i < arrLength; i++) {
                    if (!arr[i].value && arr[i]._id != id) add = 0;
                }
                if (arrLength < 2) $scope.teachingForm.newQuestions.push({ _id: id + 1, value: '' });
                else if (add) $scope.teachingForm.newQuestions.push({ _id: id + 1, value: '' });
                break;
            case 'blur':
                for (let i = 0; i < arrLength; i++) {

                    if (arr[i]._id === id)
                        if (!arr[i].value && arrLength > 1 && i != arrLength - 1) $scope.teachingForm.newQuestions.splice(i, 1);
                }

                break;
            case 'remove':

                for (let i = 0; i < $scope.teachingForm.newQuestions.length; i++) {
                    if (arr[i]._id === id && arrLength > 1) {
                        $scope.teachingForm.newQuestions.splice(i, 1);
                    }
                }
                break;
        }

    };

    $scope.viewSelector = function(action) {
        switch (action) {
            case 'results':

                $scope.teachNellie = false;
                $scope.displayQuestion = false;
                $scope.displayResults = true;
                break;
            case 'question':
                $scope.teachNellie = false;
                $scope.displayQuestion = true;
                $scope.displayResults = false;
                break;
            case 'teaching':
                $scope.teachNellie = true;
                $scope.displayQuestion = false;
                $scope.displayResults = false;
                break;
        }
    };

    $scope.showtime = function(status) {

        $scope.thanks = false;
        $scope.displayResults = false;
        $scope.displayQuestion = false;
        $scope.teachNellie = false;
        getData();

    };
    $scope.teach = function(subject = {}) {
        $scope.teachingForm = {
            fault: {
                id: subject.label ? subject.label : undefined,
                value: subject.label_value ? subject.label_value : undefined
            },
            newQuestions: [{ _id: 0, value: '' }]
        }
        $scope.displayResults = false;
        $scope.teachNellie = true;

    };
    $scope.submitForm = function() {
        /*
         * @ $scope.teachingForm = {fault: {id, value}, newQuestions: [{_id,value},{...}]}
         *
         * 
         */
        $scope.teachNellie = false;
        //sessionHistory
        let uploadForm = {
            label: $scope.teachingForm.fault,
            newFeatures: [],
            oldFeatures: []
        }
        $scope.sessionHistory.forEach(record => {
            if (record.answer == 1) uploadForm.oldFeatures.push(record.feature_id);
        })
        $scope.teachingForm.newQuestions.forEach(feature => {
            if (feature.value) uploadForm.newFeatures.push(feature.value);
        })
        console.log(uploadForm)

        $http({
            url: API_URL + '/data',
            method: "post",
            data: uploadForm
        }).then(function(response) {
            $scope.thanks = true;
            $scope.feedback = response.data;
        }).catch(err => {
            $scope.feedback = err;
        });
    };
    $scope.results = function() {
        $scope.displayQuestion = false;

        let result = sortSolutions($scope.trainingData);

        getValues('label', result.unique_ids.join(',')).then(response => {
            response.data.list.forEach(subject => {
                result.answer.forEach(result => {
                    if (result.label === subject.id) result.label_value = subject.value;
                });
            });
            $scope.faults = result;
            $scope.displayResults = true;
        }).catch(err => {
            $scope.faults = err;
        });
    };
    $scope.interact = function(action) {
        if (!$scope.buttons && action != 'load') return console.log('Button clicked before content loaded');

        function saveAnswer(id, answer) {
            $scope.sessionHistory.forEach(f => {
                if (f.feature_id == id) f.answer = answer;
            })
        }
        switch (action) {
            case 'load':
                $scope.sessionHistory = [];
                $scope.faults = [];
                break;
            case 'yes':
                saveAnswer(bestFeature.id, 1)
                break;
            case 'no':
                saveAnswer(bestFeature.id, -1)
                break;
            case 'unknown':
                saveAnswer(bestFeature.id, 0)
                break;
        }
        $scope.buttons = false;
        if (action === 'yes' || action === 'no') {
            let decision = action === 'yes' ? 1 : -1;
            $scope.trainingData = trim($scope.trainingData, bestFeature.id, decision);
        }
        bestFeature = checkHistory(getFeatures($scope.trainingData), $scope.sessionHistory);

        if (bestFeature.gain > minimalGain) {

            getValues('feature', bestFeature.id).then(response => {

                $scope.question = response.data.value;

                $scope.sessionHistory.push({ feature_id: bestFeature.id, value: response.data.value });
                $scope.displayQuestion = true;
                $scope.buttons = true;
            }).catch(err => {
                $scope.question = err;
            })
        }
        else $scope.results();
    };

    var getData = function(args) {
        var src = API_URL;
        var url = src + '/data';
        if (args) { //expect csv
            if (args.yes && args.no) url += '?yes=' + args.yes + '&no=' + args.no;
            else if (args.yes) url += '?yes=' + args.yes;
            else url += '?no=' + args.yes;
        }
        $http.get(url).then(function(response) {

            $scope.trainingData = response.data.list;
            $scope.interact('load');


        }).catch(err => {
            $scope.question = err;
        });
    };
    var getValues = function(what, id) {
        var src = API_URL;
        var url = src + '/' + what + '?id=' + id;
        return $http.get(url);
    };
    var checkHistory = function(features, history) {
        /*     @history = [{id: Number, value: String}]
         *     @features = [{id: "1", gain: "1.0000"}]
         */
        if (history.length < 1) return features[0];

        for (let i = 0; i < features.length; i++) {
            let flag = 1;
            for (let x = 0; x < history.length; x++) {
                if (features[i].id == history[x].feature_id) {
                    flag = 0;
                    break;
                }
            }
            if (flag) return features[i];
        }
        console.log('All questions asked');
        return { id: false, gain: minimalGain };
    };
    var trim = function(data, feature_id, decision) {
        let output = [];

        data.forEach(subject => {
            switch (decision) {
                case 1:
                    if (subject.features.indexOf(Number(feature_id)) > -1) output.push(subject);
                    break;
                case -1:
                    if (subject.features.indexOf(Number(feature_id)) < 0) output.push(subject);
                    break;
                default:
                    console.log('Exception @ pruning - feature ID: %s, decision: %s', feature_id, decision);
            }
        });

        return output;
    };

    var sortSolutions = function(list) {
        let result = {
            unique_ids: [],
            answer: []
        };

        list.forEach(subject => {
            let duplicate = result.answer.some(e => e.label === subject.label);
            let occurance = list.filter(e => e.label === subject.label).length;
            if (!duplicate) {
                delete subject.features;
                subject.probability = parseFloat(occurance / list.length).toFixed(2) / 1;
                result.unique_ids.push(subject.label);
                result.answer.push(subject);
            }
        });
        result.answer = result.answer.sort(function(a, b) { return b.probability - a.probability });
        return result;
    };
    var getFeatures = function(data) {
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
            let leftCount = {
                total: 0,
                labels: {},
                features: {}
            };
            let rightCount = {
                total: 0,
                labels: {},
                features: {}
            };
            dataset.forEach(subject => {
                if (subject.features.indexOf(Number(id)) > -1) {
                    leftCount.total++;
                    if (leftCount.labels[subject.label]) leftCount.labels[subject.label]++;
                    else leftCount.labels[subject.label] = 1;
                    for (let featureId of subject.features) {

                        if (leftCount.features[featureId]) leftCount.features[featureId]++;
                        else leftCount.features[featureId] = 1;
                    }
                }
                else {
                    rightCount.total++;
                    if (rightCount.labels[subject.label]) rightCount.labels[subject.label]++;
                    else rightCount.labels[subject.label] = 1;
                    for (let featureId of subject.features) {

                        if (rightCount.features[featureId]) rightCount.features[featureId]++;
                        else rightCount.features[featureId] = 1;
                    }
                }

            });
            return { leftCount, rightCount };
        }

        function calculateEntropy(count) {
            //-(x / (x+y)) * log2(x / (x+y)) - (y / (x+y)) * log2(y / (x+y));
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

            let cfeat = countFeature(data, id);
            let entropyLeft = calculateEntropy(cfeat.leftCount);
            let entropyRight = calculateEntropy(cfeat.rightCount);

            let entropyAfter = parseFloat(cfeat.leftCount.total / count.total * entropyLeft + cfeat.rightCount.total / count.total * entropyRight).toFixed(4);
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
    };

});
