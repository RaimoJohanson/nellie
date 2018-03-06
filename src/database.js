'use strict';

const DB_CONFIG = {
    client: 'mysql',
    connection: {
        host: "localhost",
        //port: "5432",
        user: 'user',
        //password: "demo",
        database: 'dbName',
        charset: "UTF8",
        timezone: "EET",
    },
    debug: false
};

module.exports = require('knex')(DB_CONFIG);
