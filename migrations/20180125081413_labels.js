exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('labels', function(table) {
            table.increments('id').primary().unique();
            table.string('value').notNullable();
            //table.integer('created_by').unsigned().references('users.id');
            //table.integer('updated_by').unsigned().references('users.id');

            table.integer('session_id').unsigned();
            table.foreign('session_id').onDelete('SET NULL').references('session_history.id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at');
        })
        .then(() => {

            return //knex('labels').insert(testData());
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('labels');
};
var testData = function() {
    var output = []
    for (var i = 1; i < 1001; i++) {
        output.push({ value: i + ' answer' })
    }
    return output;
}
