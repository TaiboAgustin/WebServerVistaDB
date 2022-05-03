const prodsOptions = require('../src/options/mariaDB');
const prodsKnex = require('knex')(prodsOptions);

const products = [{
    idproducts: 2,
    title: "Adidas Forum High 84",
    price: 120,
    thumbnail: "https://assets.adidas.com/images/w_600,f_auto,q_auto/43f112d12fea4c098b8aad8a00ebadda_9366/Zapatillas_Forum_Hi_84_Young_Star-Lord_Blanco_GW5451_01_standard.jpg"
},
{
    idproducts: 3,
    title: "Nike Blazer Mid 77",
    price: 90,
    thumbnail: "https://static.runnea.com/images/202109/nike-blazer-mid-77-hombre-400x400x80xX.jpg?1"
}
];

prodsKnex('products').insert(products)
    .then(() => console.log("Productos agregados"))
    .catch(e => {
        console.log(e)
    }).finally(() => {
        prodsKnex.destroy();
    });