'use strict';

const DB_CONFIG = {
    client: 'mysql',
    connection: {
        host: "localhost",
        //port: "5432",
        user: "DB_USER",
        password: "DB_USER_PASSWORD",
        database: "DB_NAME",
        charset: "UTF8",
        timezone: "EET",
    },
    debug: false
};

module.exports = require('knex')(DB_CONFIG);
