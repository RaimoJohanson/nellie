exports.up = function(knex, Promise) {
    return knex.schema
        .createTable('label_features', function(table) {
            table.increments('id').primary().unique();
            table.integer('label_id').unsigned();
            table.foreign('label_id').onDelete('CASCADE').references('labels.id');
            table.string('features').notNullable();
            table.integer('session_id').unsigned();
            table.foreign('session_id').onDelete('SET NULL').references('session_history.id');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at');
        })
        .then(() => {

            return //knex('label_features').insert(testData());
        });
};

exports.down = function(knex, Promise) {
    return knex.schema
        .dropTable('label_features');
};

var testData = function() {
    var output = []
    var maxFeature = 500;
    var maxLabel = 1000;
    for (var i = 1; i < 20000; i++) {
        var num = Math.floor(Math.random() * ((10 - 3) + 1) + 3);
        //features
        var feature_ids = [];
        for (var z = 0; z < num; z++) {

            var random = Math.floor(Math.random() * ((maxFeature - 1) + 1) + 1);
            var c = 0;
            while (feature_ids.indexOf(random) != -1 || c < 100) {
                c++;
                var reroll = Math.floor(Math.random() * ((maxFeature - 1) + 1) + 1);
                var prob = Math.floor(Math.random() * ((maxFeature - 1) + 1) + 1);
                if (reroll > prob) random = reroll;

            }
            feature_ids.push(random);
        }
        output.push({
            label_id: Math.floor(Math.random() * ((maxLabel - 1) + 1) + 1),
            features: '||' + feature_ids.join('||') + '||'
        })
    }
    return output;
}
