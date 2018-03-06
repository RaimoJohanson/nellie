exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('session_history', function(table) {
            table.increments('id').primary().unique();
            table.string('ipv4').notNullable();
            table.timestamp('started_at').defaultTo(knex.fn.now());
            table.timestamp('ended_at');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('session_history');
};
