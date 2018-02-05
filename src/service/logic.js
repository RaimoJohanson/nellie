'use strict';

module.exports = function(app) {
    var LabelFeatures = require('../model/generic')(app, 'label_features');
    var Labels = require('../model/generic')(app, 'labels');
    var Features = require('../model/generic')(app, 'features');
    let output = {

        data: function(query) {
            return new Promise((resolve, reject) => {

                let opts = {};
                if (query) {
                    opts.whereRaw = "";
                    if (query.yes) {

                        query.yes.split(',').forEach(f => {
                            if (opts.whereRaw.length) opts.whereRaw += ' and ';
                            opts.whereRaw += '(features like "%,' + f + '" or features like "' + f + ',%" or features like "%,' + f + ',%")';
                        })
                    }
                    if (query.no) {

                        query.no.split(',').forEach(f => {
                            if (opts.whereRaw.length) opts.whereRaw += ' and ';
                            opts.whereRaw += '(features not like "%,' + f + '" and features not like "' + f + ',%" and features not like "%,' + f + ',%")';
                        })
                    }

                }
                LabelFeatures.find(['label_id as label', 'features'], opts || null).then(data => {
                    data.forEach(record => {
                        record.features = record.features.split(',').map(Number);
                    })
                    return resolve(data);
                }).catch(reject);

            })
        },
        getFeature: function(feature_id) {
            return new Promise((resolve, reject) => {
                Features.find(['id', 'value'], { where: { id: feature_id } }).then(data => {

                    return resolve(data[0]);
                }).catch(reject);

            })
        },

        getLabel: function(input) {
            if (typeof(input) === 'number') return Labels.find(['id', 'value'], { where: { id: input } });
            else return Labels.find(['id', 'value'], { whereIn: ['id', input.split(',').map(Number)] });
        },
        addData: function(data) {
            return new Promise((resolve, reject) => {
                console.log(data);
                resolve('THANKS');

            })
        }
    };

    return output;

}; //end of module.exports
