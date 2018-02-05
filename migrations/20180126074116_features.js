exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('features', function(table) {
            table.increments('id').primary().unique();
            table.string('value').notNullable();
            //table.integer('created_by').unsigned().references('users.id');
            //table.integer('updated_by').unsigned().references('users.id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at');
        }).then(() => {

            return knex('features').insert(testData);
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('features');
};

var testData = [{
        value: 'Kas on kuulda mingit heli?'
    },
    {
        value: 'Kas on tunda ebaloomulikku vibratsiooni või "jõnksutamist"?'
    },
    {
        value: 'Kas on tunda mingit aroomi?'
    },
    {
        value: 'Kas on midagi nähtavalt valesti?'
    },
    //EELDEFINEERITUD KATEGOORIAD
    {
        value: 'Kas viga võib olla seotud mootoriga?'
    },
    {
        value: 'Kas viga võib olla seotud juhtimise ja/või veermikuga?'
    },
    {
        value: 'Kas viga võib olla seotud käigukastiga?'
    },
    {
        value: 'Kas viga võib olla seotud pidurisüsteemiga?'
    },
    {
        value: 'Kas viga võib olla seotud elektrisüsteemiga?'
    },
];
