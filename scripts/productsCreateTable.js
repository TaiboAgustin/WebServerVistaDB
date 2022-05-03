const {
    default: knex
} = require('knex');
const prodsOptions = require('../options/mariaDB');
const prodsKnex = require('knex')(prodsOptions);

prodsKnex.schema.createTable('products', (table) => {
        table.increments('id');
        table.string('title');
        table.double('price');
        table.string('thumbnail');
    })
    .then(() => {
        console.log('Table created!');
    })
    .catch(e => {
        console.log('Could not create table: ', e);
    })
    .finally(() => {
        prodsKnex.destroy();
    });