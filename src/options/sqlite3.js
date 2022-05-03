const options = {
    client: 'sqlite3',
    connection: {
        filename: 'src/db/ecommerce.sqlite',
    },
    useNullAsDefault: true
}

console.log('Conectando a la base de datos de Mensajes...');

module.exports = options;