'use strict';
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
const regexId = /^[0-9]*$/g;
module.exports = function(app) {
    var LabelFeatures = require('../model/generic')(app, 'label_features');
    var Labels = require('../model/generic')(app, 'labels');
    var Features = require('../model/generic')(app, 'features');
    var SessionHistory = require('../model/generic')(app, 'session_history');
    var SessionAnswers = require('../model/generic')(app, 'session_answers');
    var SessionResults = require('../model/generic')(app, 'session_results');
    var Feedback = require('../model/generic')(app, 'feedback');

    let output = {

        feedback: function(session_id, data) {
            return new Promise((resolve, reject) => {

                async.each(data, (opinion, cb) => {
                    Feedback.insert({ question: opinion.question, value: opinion.value, session_id: session_id }).then(cb).catch(reject);
                }, () => {
                    resolve();
                });
            });
        },
        initSession: function(ip) {
            return SessionHistory.insert({ 'ipv4': ip });
        },
        updateSession: function(session_id, data) {
            return new Promise((resolve, reject) => {

                let date = moment().format("YYYY-MM-DD kk:mm:ss");
                let endedAt = SessionHistory.update({ ended_at: date }, { id: session_id });

                let interactions = new Promise((resolve, reject) => {
                    /*console.log(data.interactions);
                    [{ id: 20,
                        gain: '0.6500',
                        value: 'Unexpected engine cut off while driving?',
                        elapsedTime: 45,
                        decision: 1
                    }]
                    */
                    if (!data.sessionHistory) return resolve();

                    async.each(data.sessionHistory.interactions, (record, cb) => {
                        let data = {
                            gain: record.gain,
                            feature_id: record.id,
                            elapsedTime: record.elapsedTime,
                            decision: record.decision,
                            session_id: session_id
                        };
                        SessionAnswers.insert(data).then(() => { cb(); }).catch(reject);

                    }, (err) => {
                        if (err) return reject(err);
                        else resolve();
                    });

                });
                let results = new Promise((resolve, reject) => {
                    /*
                    [{ 
                    label: 4,
                    fitness: 4.5,
                    probability: 0.31,
                    label_value: 'Faulty engine control unit (ECU)'
                    } ]
                    */
                    if (!data.results) return resolve();

                    async.each(data.results, (result, cb) => {
                        let data = {
                            label_id: result.label,
                            fitness: result.fitness,
                            probability: result.probability,
                            session_id: session_id
                        };
                        SessionResults.insert(data).then(() => { cb(); }).catch(reject);

                    }, (err) => {
                        if (err) return reject(err);
                        else resolve();
                    });
                });

                Promise.all([endedAt, interactions, results]).then(resolve).catch(reject);
            });
        },
        data: function(query) {
            return new Promise((resolve, reject) => {
                let opts = {};
                if (query) {

                    if (query.label_id) {
                        query.label_id = parseInt(query.label_id);

                        if (query.label_id < 1) return reject('Invalid parameter');
                        if (isNaN(query.label_id)) return reject('Data: No nummerical IDs');

                        opts.where = { 'label_id': query.label_id };
                    }
                    else {
                        opts.whereRaw = "";
                        if (query.yes) query.yes.split(',').forEach(f => {
                            if (opts.whereRaw.length) opts.whereRaw += ' and ';
                            opts.whereRaw += '(features like "%||' + f + '||%")';
                        });

                        if (query.no) query.no.split(',').forEach(f => {
                            if (opts.whereRaw.length) opts.whereRaw += ' and ';
                            opts.whereRaw += '(features not like "%||' + f + '||%")';
                        });
                    }
                }
                LabelFeatures.find(['label_id as label', 'features'], opts).then(data => {

                    async.each(data, (record, cb) => {
                        record.features = record.features.split('||').slice(1, -1).map(Number);
                        cb();
                    }, () => {
                        return resolve({ list: data });
                    });

                }).catch(reject);
            });
        },
        getFeature: function(query) {
            return new Promise((resolve, reject) => {
                if (query.id < 1) reject('Invalid parameter');
                if (!query.id) return reject('Missing parameter');
                if (isNaN(parseInt(query.id))) return reject('Invalid parameter');

                Features.find(['id', 'value'], { where: { id: query.id } }).then(data => {
                    return resolve(data[0]);
                }).catch(reject);
            });
        },
        getLabel: function(query) {

            if (query.id) {
                return new Promise((resolve, reject) => {
                    if (query.id < 1) reject('Missing parameter');
                    let opts = {};
                    if (typeof(query.id) === 'number') opts.where = { id: query.id };
                    else opts.whereIn = ['id', query.id.split(',').map(Number)];


                    Labels.find(['id', 'value'], opts || null).then(list => {
                        resolve({ list: list });
                    }).catch(reject);

                });
            }
            else if (query.name) {
                return new Promise((resolve, reject) => {
                    /*
                     * @query.name = "this is a phrase"
                     */
                    let words = query.name.split(" ");
                    let bestMatch = [];
                    async.each(words, (word, cb) => {
                        if (word.length > 2) {
                            Labels.find(['id', 'value'], { whereRaw: 'value like "%' + word + '%"' }).then(r => {
                                if (r.length) {
                                    if (!bestMatch.length) bestMatch = r;
                                    else if (r.length < bestMatch.length) bestMatch = r;
                                    else if (r.length === bestMatch.length) {
                                        r.forEach(res => {
                                            if (_.some(bestMatch, res) === false) bestMatch.push(res);
                                        });
                                    }
                                }
                                cb();
                            });
                        }
                        else cb();

                    }, () => {
                        return resolve({ list: bestMatch });
                    });
                });
            }
            else {
                return new Promise((resolve, reject) => reject('Missing parameter'));
            }

        },
        addData: function(data) {
            /*
             * @data = { label: { label: 2, label_value: 'Kulunud stabilisaatori varras' },
             *            newFeatures: [ 'jhjjnjnk', 'cghhgcttttt', 'jasdasd?' ],
             *            oldFeatures: [2,3,4],
             *            session_id: NUMBER
             *          }
             */
            return new Promise((resolve, reject) => {

                //todo:
                let label = new Promise((resolve, reject) => {
                    if (data.label.label) return resolve(data.label.label);
                    else Labels.insert({ value: data.label.label_value, session_id: data.session_id }).then(id => resolve(id[0])).catch(reject);
                });
                let features = new Promise((resolve, reject) => {

                    let newFeatureIds = [];
                    async.each(data.newFeatures, (feature, cb) => {
                        Features.insert({ value: feature, session_id: data.session_id }).then(id => {
                            newFeatureIds.push(id[0]);
                            cb();
                        })

                    }, () => {
                        return resolve(newFeatureIds)
                    })
                });
                Promise.all([label, features]).then(result => {
                    let label_id = result[0];
                    let feature_ids = data.oldFeatures.concat(result[1])
                    LabelFeatures.insert({ label_id: label_id, features: '||' + feature_ids.join('||') + '||', session_id: data.session_id }).then(id => {
                        resolve('all done');
                    }).catch(reject);
                }).catch(reject);

            })
        },
        endorseData: function(data) {
            return LabelFeatures.insert({ label_id: data.label.label, features: '||' + data.oldFeatures.join('||') + '||', session_id: data.session_id })
        }
    };

    return output;

}; //end of module.exports
