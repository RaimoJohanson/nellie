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

App.controller("asking", function($rootScope, $scope, $http, $timeout) {

    $rootScope.sessionHistory = {
        hit_count: 0,
        interactions: []
    };
    $scope.busy = true;
    $scope.round = 1;

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

        $rootScope.sessionHistory.interactions.push($scope.currentQuestion);

        if ($scope.currentQuestion.decision != 2) {
            $rootScope.trainingData = calcFitness($rootScope.trainingData, $rootScope.sessionHistory.interactions);
            if ($scope.round > 4 && $scope.round % 2 === 0) {
                // console.log('Length of trainingData before trimming:', $rootScope.trainingData.length);
                $rootScope.trainingData = trim($rootScope.trainingData, $rootScope.sessionHistory.interactions);
                // console.log('Length of trainingData after trimming:', $rootScope.trainingData.length);
            }
        }
        //omg
        var oldValue = $scope.currentQuestion.value;

        $scope.currentQuestion = checkHistory(getFeatures($rootScope.trainingData), $rootScope.sessionHistory.interactions);

        $scope.currentQuestion.value = oldValue;

        $scope.round++;

        if ($scope.currentQuestion.gain > $rootScope.minimalGain) displayQuestion($scope.currentQuestion);

        else if ($scope.currentQuestion.id && $rootScope.sessionHistory.hit_count < 3) {
            //min $rootScope.sessionHistory.hit_count = 3
            displayQuestion($scope.currentQuestion);
        }
        else {
            $rootScope.trainingData = trim($rootScope.trainingData, $rootScope.sessionHistory.interactions);
            $rootScope.view = "results";
        }

    };

    function displayQuestion() {

        $http.get(API_URL + '/feature?id=' + $scope.currentQuestion.id).then(response => {

            $scope.currentQuestion.value = response.data.value;

            $scope.busy = false; //buttons are active

            $rootScope.loading = false; //stop loading animation

            $scope.time = Date.now();

        }).catch(err => {
            $scope.currentQuestion.value = err.data;
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
    }

    function trim(data, interactions) {
        let amountOfImmuneLabels = 3;
        let output = [];
        let fitness_sum = 0;
        data.forEach(e => {
            fitness_sum += e.fitness;
        });
        let avg_fitness = fitness_sum / data.length;

        //console.log('Average fitness:', avg_fitness);
        //console.log(data);
        data.forEach(e => {

            //console.log('Label instance %s.fitness= %s', e.label, e.fitness);
            if (e.fitness >= avg_fitness) output.push(data.splice(data.indexOf(e), 1)[0]);

        });
        /*console.log('Labels that have higher than average fitness: ', output.length);
        console.log(output);
        console.log('dataset length after sorting immune labels: ', data.length);
        console.log(data);
        */
        interactions.forEach(record => { //update data per each interaction;
            if (record.decision < 2) data = prune(data, record.id, record.decision);
        });


        function prune(dataset, id, decision) {
            let cache = [];
            dataset.forEach(subject => {

                switch (decision) {
                    case 1:
                        if (subject.features.indexOf(Number(id)) > -1) {

                            cache.push(subject);
                        }
                        break;
                    case 0:
                        if (subject.features.indexOf(Number(id)) < 0) {

                            cache.push(subject);
                        }
                        break;
                    default:
                        console.log('Exception @ pruning - feature ID: %s, decision: %s', id, decision);

                }

            });
            return cache;
        }
        output = output.concat(data);
        return output;
    }


    function calcFitness(data, sessionHistory) {
        data.forEach(subject => {
            let matches = 0;
            sessionHistory.forEach(record => {
                switch (record.decision) {
                    case 1:
                        if (subject.features.indexOf(Number(record.id)) > -1) matches++;
                        else matches--;
                        break;
                        /*
                                            case 0:
                                                if (subject.features.indexOf(Number(record.id)) < 0) matches++;
                                                else matches--;
                                                break;
                                                */
                }
            });
            subject.fitness = matches / $rootScope.sessionHistory.hit_count;
        });
        return data;


        /*
        data.forEach(subject => {
            switch (decision) {
                case 1:
                    if (subject.features.indexOf(Number(feature_id)) > -1) subject.fitness += (1 / subject.features.length);
                    else subject.fitness -= (1 / subject.features.length);
                    break;
                case 0:
                    if (subject.features.indexOf(Number(feature_id)) < 0) subject.fitness += (1 / subject.features.length);
                    else subject.fitness -= (1 / subject.features.length);
                    break;
            }
        });
        return data;
        
        ======
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
        */
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
            informationGain[id] = parseFloat(iGain).toFixed(4) / 1;

        }
        //console.log('Infromation Gain:', informationGain);

        let gains = [];
        for (let id in informationGain) {
            gains[gains.length] = { id: Number(id), gain: informationGain[id] };

        }
        //console.log('Sorted order of features based on info gain:');
        return gains.sort(function(a, b) { return b.gain - a.gain });
    }
});

App.controller("results", function($rootScope, $scope, $http, $timeout) {
    $scope.faults = sortSolutions($rootScope.trainingData); //sort by percentage

    $scope.uploadSession({
        sessionHistory: $rootScope.sessionHistory,
        results: $scope.faults.answer
    });

    if ($rootScope.sessionHistory.hit_count >= $rootScope.minHitCount) {

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
                result.unique_ids.push(subject.label);
                result.answer.push(subject);
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

App.directive("feedback", function($templateCache, $http, $compile, $document, $rootScope, $timeout) {
    return {
        restrict: "A",
        scope: false,
        link: function($scope, $element, $attrs) {
            var state = 0;
            $scope.feedbackQuestions = [{
                    _id: 1,
                    label: "Ease of adding a new fault?",
                    type: 'starRating'
                },
                {
                    _id: 2,
                    label: "Understandability of the questions?",
                    type: 'starRating'
                }, {
                    _id: 3,
                    label: "Accuracy of the results?",
                    type: 'starRating'
                }, {
                    _id: 4,
                    label: "Suggestions",
                    type: 'textarea'
                }, {
                    _id: 5,
                    label: "Bug report",
                    type: 'textarea'
                }
            ];
            $scope.submitFeedback = function() {
                $scope.busy = true;
                var payload = [];
                for (var question in $scope.feedback) {
                    $scope.feedbackQuestions.forEach(fq => {
                        if (fq._id == question) {
                            payload.push({
                                question: fq.label,
                                value: $scope.feedback[question]
                            })
                        }
                    })
                }

                $http({
                    url: API_URL + '/feedback/' + $rootScope.session_id,
                    method: "post",
                    data: payload
                }).then(function(response) {
                    $scope.busy = false;
                    $scope.feedbackSent = true;

                }).catch(err => {
                    $scope.alertBox(err.data);
                });
            };

            function openModal() {
                if (state == 1) { return false; }
                state = 1;
                $scope.feedbackSent = false;
                console.log('openModal');
                $scope.feedback = {};
                $("body").addClass("modal-open");

                $http.get('app/templates/feedbackmodal.tpl').then(function(response) {

                    //$("body").append(response.data);
                    //console.log($document.find("#popup-modal"));

                    var modal = $compile(response.data)($scope);

                    $document.find('body').eq(0).append(modal);

                    $('#popup-modal').bind("click", function(e) {
                        if ($(e.target).is("#popup-modal, #close-modal")) {
                            $(this).remove();
                            $("body").removeClass("modal-open");
                            state = 0;
                        }

                    });

                    $timeout(function() {
                        $scope.$apply();
                    }, 0);
                });
            };

            $element.bind("click", function(e) {
                e.preventDefault();
                openModal();
            });
        }
    }
});

App.directive("href", function($rootScope, $timeout) {
    return {
        restrict: "A",
        link: function($scope, $element, $attr) {

            $element.bind("click", function(e) {
                e.preventDefault();
                if ($attr.href !== "javascript:void(0);") {
                    $rootScope.view = $attr.href;
                    $timeout(function() {
                        $rootScope.$apply();
                    }, 0);
                }
            });
        }
    }
});
