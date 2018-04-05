'use strict';
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
module.exports = function(app) {
    var LabelFeatures = require('../model/generic')(app, 'label_features');
    var Labels = require('../model/generic')(app, 'labels');
    var Features = require('../model/generic')(app, 'features');
    var SessionHistory = require('../model/generic')(app, 'session_history');
    var SessionAnswers = require('../model/generic')(app, 'session_answers');
    var SessionResults = require('../model/generic')(app, 'session_results');
    var Feedback = require('../model/generic')(app, 'feedback');

    let output = {

        dataset: function() {
            return new Promise((resolve, reject) => {
                let labels = Labels.find();

                let features = Features.find();

                let instances = LabelFeatures.find();

                let sessions = SessionHistory.find();

                let feedback = Feedback.find();

                Promise.all([labels, features, instances, sessions, feedback]).then(data => {
                    let summary = {
                        labels: {
                            name: 'Faults',
                            headers: Object.keys(data[0][0]),
                            list: data[0]
                        },
                        features: {
                            name: 'Questions',
                            headers: Object.keys(data[1][0]),
                            list: data[1]
                        },
                        instances: {
                            name: 'Instances',
                            headers: Object.keys(data[2][0]),
                            list: data[2]
                        },
                        sessions: {
                            name: 'Sessions',
                            headers: Object.keys(data[3][0]),
                            list: data[3]
                        },
                        feedback: {
                            name: 'Feedback',
                            headers: Object.keys(data[4][0]),
                            list: data[4]
                        }
                    };

                    return resolve(summary);

                }).catch(reject);

            });
        },
        sessionData: function(session_id) {
            return new Promise((resolve, reject) => {
                let sess_ans = new Promise((resolve, reject) => {
                    SessionAnswers.find('*', { where: { session_id: session_id } }).then(data => {
                        if (!data) return resolve([]);
                        async.each(data, (record, cb) => {
                            Features.find('value', { where: { id: record.feature_id } }).then(feature_value => {
                                record.feature_value = feature_value[0].value;
                                cb();
                            }).catch(reject);
                        }, () => {
                            return resolve(data);
                        });
                    }).catch(reject);
                });
                let sess_res = new Promise((resolve, reject) => {
                    SessionResults.find('*', { where: { session_id: session_id } }).then(data => {
                        if (!data) return resolve([]);
                        async.each(data, (record, cb) => {
                            Labels.find('value', { where: { id: record.label_id } }).then(label_value => {
                                record.label_value = label_value[0].value;
                                cb();
                            }).catch(reject);
                        }, () => {
                            return resolve(data);
                        });
                    }).catch(reject);
                });


                Promise.all([sess_ans, sess_res]).then(data => {

                    let summary = {
                        answers: {
                            name: 'Answers',
                            headers: data[0].length ? Object.keys(data[0][0]) : [],
                            list: data[0]
                        },
                        report: {
                            name: 'Report',
                            headers: data[1].length ? Object.keys(data[1][0]) : [],
                            list: data[1]
                        }
                    };

                    return resolve(summary);

                }).catch(err => {
                    console.log(err);
                });
            });
        }
    };

    return output;

}; //end of module.exports
