const options = require('../src/options/sqlite3');
const knex = require('knex')(options);

knex.schema.createTable('messages', table => {
    table.string('email');
    table.string('date');
    table.string('msg');
}).then(() => {
    console.log('Tabla messages creada.');
    knex.destroy();
}).catch(e => {
    console.log('Error al crear tabla messages.', e);
    knex.destroy();
});