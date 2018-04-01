exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('feedback', function(table) {
            table.increments('id').primary().unique();
            table.string('question');
            table.text('value');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.integer('session_id').unsigned();
            table.foreign('session_id').onDelete('CASCADE').references('session_history.id');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('feedback');
};
