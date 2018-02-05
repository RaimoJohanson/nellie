"use strict";


module.exports = function(app, TABLE_NAME) {
    let Knex = app.get("knex");

    return {
        find: function(columns, opts) {
            if (!columns) columns = '*';
            let qb = Knex(TABLE_NAME);
            qb.select(columns);
            console.log('opts', opts);
            if (opts) {
                if (opts['where'] && Array.isArray(opts['where'])) opts['where'].forEach(clause => { qb.where(clause[0], clause[1], clause[2]) });
                else if (opts['where'] && typeof(opts['where']) === 'object') qb.where(opts.where);



                if (opts['count']) qb.count(opts.count);
                //else if (opts['count'] && Array.isArray(opts['count'])) opts['count'].forEach(clause => { qb.count(clause) });

                if (opts['whereNotNull']) qb.whereNotNull(opts.whereNotNull);
                if (opts['whereIn']) qb.whereIn(opts.whereIn[0], opts.whereIn[1]);


                else if (opts['whereRaw']) qb.whereRaw(opts.whereRaw);

                if (opts['orderBy']) qb.orderBy(opts.orderBy[0], opts.orderBy[1]);

                if (opts['limit']) qb.limit(Number(opts.limit));
                if (opts['page']) qb.offset((opts.page * opts.limit - opts.limit));
            }

            return qb;
        },
        select: function(columns, where) {
            return Knex(TABLE_NAME).select(columns).where(where);
        },
        insert: function(data) {
            return Knex(TABLE_NAME).insert(data).returning('id');
        },
        update: function(data, where) {
            return Knex(TABLE_NAME).update(data).where(where);
        },

        delete: function(where) {
            return Knex(TABLE_NAME).del().where(where);

        },
    };

};
