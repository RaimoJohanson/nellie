exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('session_results', function(table) {
            table.increments('id').primary().unique();
            table.integer('label_id').unsigned();
            table.foreign('label_id').onDelete('CASCADE').references('labels.id');
            table.float('fitness', 6, 2);
            table.float('probability', 6, 2);
            table.integer('session_id').unsigned();
            table.foreign('session_id').onDelete('CASCADE').references('session_history.id');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('session_results');
};
