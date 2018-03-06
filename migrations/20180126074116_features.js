exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('features', function(table) {
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

            return //knex('features').insert(testData());
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('features');
};
/*

var testData = [
    //EMPIIRILISED SÜMPTOMID
    {
        value: 'Kas on kuulda mingit ebaloomulikku heli?'
    },
    {
        value: 'Kas kiirendus on ebasujuv?'
    },
    {
        value: 'Kas sõit ühtlasel kiirusel on ebasujuv?'
    },
    {
        value: 'Kas sõit pidurdamine on ebasujuv?'
    },
    {
        value: 'Kas on tunda mingit aroomi?'
    },
    {
        value: 'Kas on midagi nähtavalt valesti?'
    },
];
*/
var testData = function() {
    var output = []
    for (var i = 1; i < 1001; i++) {
        output.push({ value: i + '?' })
    }
    return output;
}
