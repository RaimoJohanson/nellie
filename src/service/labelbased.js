'use strict'

var data = [
    { label: 'A', features: [1, 2, 3, 4] },
    { label: 'B', features: [1, 2, 3] },
    { label: 'C', features: [1, 2, 4] },
    { label: 'C', features: [1, 5] },
    { label: 'C', features: [5, 9, 3] },
    { label: 'C', features: [1, 2, 4] },
    { label: 'C', features: [1, 2, 20] },
    { label: 'B', features: [1, 2, 3] },
    { label: 'A', features: [1, 2, 3, 4] },
    { label: 'B', features: [1, 2, 3, 4] },
    { label: 'A', features: [1, 2, 3, 4] },
    { label: 'B', features: [1, 2, 3] },
    { label: 'F', features: [1, 2, 7, 4] },
    { label: 'F', features: [1, 2, 3] },
    { label: 'E', features: [1, 2, 9] },
    { label: 'B', features: [1, 2, 7, 4, 5] },
    { label: 'D', features: [1, 9, 2, 5] },
    { label: 'C', features: [1, 1, 2, 5] },
    { label: 'D', features: [1, 2, 9] },
    { label: 'Z', features: [18, 1, 3, 4] },
];


var data2 = [
    { label: 'm', features: [1] },
    { label: 'm', features: [1] },
    { label: 'm', features: [1] },
    { label: 'f', features: [1] },
    { label: 'f', features: [1] },
    { label: 'f', features: [1] },
    { label: 'f', features: [2] },
    { label: 'm', features: [2] },
    { label: 'm', features: [2] },
    { label: 'm', features: [2] },
    { label: 'm', features: [2] },
    { label: 'm', features: [2] },
    { label: 'm', features: [2] },
    { label: 'f', features: [1] },
];





function questionId(data) {
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

    console.log('Count before:');
    console.log(count);

    let entropyBefore = calculateEntropy(count);
    console.log('Entropy before: %s', entropyBefore);
    let informationGain = {};



    for (let id in count.features) { //each feature

        let cfeat = countFeature(data, id);
        console.log('New count for feature: %s', id);
        console.log('YES', cfeat.leftCount.total);
        console.log(cfeat.leftCount.labels);
        console.log('NO', cfeat.rightCount.total);
        console.log(cfeat.rightCount.labels);
        let entropyLeft = calculateEntropy(cfeat.leftCount);
        let entropyRight = calculateEntropy(cfeat.rightCount);

        let entropyAfter = parseFloat(cfeat.leftCount.total / count.total * entropyLeft + cfeat.rightCount.total / count.total * entropyRight).toFixed(4);
        console.log('Entropy after: %s', entropyAfter);

        let iGain = entropyBefore - entropyAfter;
        informationGain[id] = parseFloat(iGain).toFixed(4);

    }
    console.log('Infromation Gain:');
    console.log(informationGain);
    /*
    Entropy_before = - (5/14)*log2(5/14) - (9/14)*log2(9/14) = 0.9403
    count.features[1]
    Entropy_left = - (3/7)*log2(3/7) - (4/7)*log2(4/7) = 0.9852

    Entropy_right = - (6/7)*log2(6/7) - (1/7)*log2(1/7) = 0.5917

    Entropy_after = 7/14*Entropy_left + 7/14*Entropy_right = 0.7885

    Information_Gain = Entropy_before - Entropy_after = 0.1518
    */
    let maxGain = { gain: 0, feature_id: 0 };
    let gains = [];
    for (let id in informationGain) {
        gains.push({ id: id, gain: informationGain[id] });
        if (informationGain[id] > maxGain.gain) {
            maxGain.gain = informationGain[id];
            maxGain.feature_id = id;
        }
    }
    console.log('Maximum Gain:')
    console.log(maxGain);
    console.log(gains);
    console.log('Sorted order of features based on info gain:');
    console.log(gains.sort(function(a, b) { return b.gain - a.gain }));
}


questionId(data);
