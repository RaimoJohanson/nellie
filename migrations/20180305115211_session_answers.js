exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('session_answers', function(table) {
            table.increments('id').primary().unique();
            table.integer('feature_id').unsigned();
            table.foreign('feature_id').onDelete('CASCADE').references('features.id');
            table.float('gain', 8, 4);
            table.integer('elapsedTime').unsigned(); //todo: elapsedTime -> elapsed_time for consistency
            table.integer('decision').unsigned();
            table.integer('session_id').unsigned();
            table.foreign('session_id').onDelete('CASCADE').references('session_history.id');
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('session_answers');
};
