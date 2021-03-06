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
