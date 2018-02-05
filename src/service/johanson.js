'use strict'

var data = [
    { label: 'A', features: [1, 2, 3, 4] },
    { label: 'B', features: [1, 2, 3] },
    { label: 'C', features: [1, 2] },
    { label: 'C', features: [1, 5] },
    { label: 'C', features: [5, 4, 3] },
    { label: 'C', features: [1, 2, 4] },
    { label: 'C', features: [1, 2] },
    { label: 'B', features: [1, 2, 3] },
    { label: 'A', features: [1, 2, 3, 4] },
];

/*
var data = [
    { value: 'C', features: [1, 2] },
    { value: 'C', features: [1, 2] },
    { value: 'B', features: [1] },
    { value: 'A', features: [1] }
];
*/




function main(data) {
    function countData(dataset) {
        let output = {
            total: 0,
            features: {}
        };
        dataset.forEach(value => {
            for (var featureId of value.features) {
                output.total++;
                if (output.features[featureId]) output.features[featureId]++;
                else output.features[featureId] = 1;
            }
        });
        return output;
    }

    function countFeature(dataset, id) {
        let leftCount = {
            total: 0,
            features: {}
        };
        let rightCount = {
            total: 0,
            features: {}
        };
        dataset.forEach(subject => {
            if (subject.features.indexOf(Number(id)) > -1) {

                for (var featureId of subject.features) {
                    leftCount.total++;
                    if (leftCount.features[featureId]) leftCount.features[featureId]++;
                    else leftCount.features[featureId] = 1;
                }
            }
            else {
                for (var featureId of subject.features) {
                    rightCount.total++;
                    if (rightCount.features[featureId]) rightCount.features[featureId]++;
                    else rightCount.features[featureId] = 1;
                }
            }

        });
        return { leftCount, rightCount };
    }

    function calcEntropy(count) {
        //let equation = -(5 / 14) * Math.log2(5 / 14) - (9 / 14) * Math.log2(9 / 14);
        let result = -1;
        for (let id in count.features) {
            let i = Number(count.features[id]);
            if (result === -1) result *= (i / count.total) * Math.log2(i / count.total);
            else result -= (i / count.total) * Math.log2(i / count.total);
        }
        return result;
    }


    let count = countData(data);
    console.log('Count before:');
    console.log(count);
    let entropyBefore = calcEntropy(count);
    console.log('Entropy before: %s', entropyBefore);
    let informationGain = {};



    for (let id in count.features) { //each feature
        let cfeat = countFeature(data, id);
        console.log('New count for feature: %s ', id);
        console.log('YES', cfeat.leftCount.total);
        console.log('NO', cfeat.rightCount.total);
        let entropyLeft = calcEntropy(cfeat.leftCount);
        let entropyRight = calcEntropy(cfeat.rightCount);

        let entropyAfter = cfeat.leftCount.total / count.total * entropyLeft + cfeat.rightCount.total / count.total * entropyRight;
        let iGain = entropyBefore - entropyAfter;
        informationGain[id] = parseFloat(iGain).toFixed(4);

    }
    console.log('Infromation Gain:');
    console.log(informationGain);
}
/*
Entropy_before = - (5/14)*log2(5/14) - (9/14)*log2(9/14) = 0.9403
count.features[1]
Entropy_left = - (3/7)*log2(3/7) - (4/7)*log2(4/7) = 0.9852

Entropy_right = - (6/7)*log2(6/7) - (1/7)*log2(1/7) = 0.5917

Entropy_after = 7/14*Entropy_left + 7/14*Entropy_right = 0.7885

Information_Gain = Entropy_before - Entropy_after = 0.1518
*/

//calcEntropy(data, { total: 14, features: { f: 5, m: 9 } });
main(data);
