exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('label_features', function(table) {
            table.increments('id').primary().unique();
            table.integer('label_id').unsigned();
            table.foreign('label_id').onDelete('CASCADE').references('labels.id');
            table.string('features').notNullable();
            //table.integer('created_by').unsigned().references('users.id');
            //table.integer('updated_by').unsigned().references('users.id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at');
        }).then(() => {

            return knex('label_features').insert(testData);
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('label_features');
};
var testData = [{
        label_id: 1,
        features: '2,5,9'
    },
    {
        label_id: 2,
        features: '1,2,6'
    },
    {
        label_id: 2,
        features: '1,6'
    }
];
