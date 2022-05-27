const express = require("express");
const {
    engine
} = require("express-handlebars");
const fs = require('fs');

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const routerAPI = express.Router();
const PORT = 8080; //+
// middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("./public"));
app.use("/api", routerAPI);
server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
server.on("error", (error) => console.log("Server Error\n\t", error));
const mongoose = require("mongoose");
const denv = require('dotenv');
const dotenv = denv.config();
const Message = require("./db/Message");

//faker
const {
    faker
} = require('@faker-js/faker');

//normalizr
const normalizr = require('normalizr');
const normalize = normalizr.normalize;
const denormalize = normalizr.denormalize;
const schema = normalizr.schema;

const author = new schema.Entity('authors', {}, {
    idAttribute: 'email'
})
const text = new schema.Entity('texts', {
    author: author
}, {
    idAttribute: '_id'
})


// handlebars engine
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/views",
        partialsDir: __dirname + "/views/partials",
    })
);
app.set("views", "src/views");
app.set("view engine", "hbs");
app.get('/', (_, res) => res.redirect('/productos'));

//Mongoose
connect()

function connect() {
    mongoose.connect(process.env.MONGO_ATLAS_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 1000
        })
        .then(() => console.log('Conectado a la base de datos...'))
        .catch(error => console.log('Error al conectarse a la base de datos', error));
}




//ProductsDB
const prodsOptions = require('./options/mariaDB');
const prodsKnex = require('knex')(prodsOptions);

// Ruta base para uso de HANDLEBARS
app.get('/productos', (req, res) => {
    prodsKnex.select('*').from('products')
        .then(products => {
            res.render('index', {
                ok: true,
                error: null,
                products: products
            })
        })
        .catch(e => {
            console.log('Error getting messages: ', e);
        })
});

//Función generadora de productos.
faker.locale = 'es'

function genProducts(cant) {
    const generatedProducts = [];
    let r = 0;

    for (let i = 0; i < cant; i++) {
        generatedProducts.push({
            id: faker.datatype.uuid(),
            title: faker.commerce.product(),
            thumbnail: `${faker.image.technics()}?random=${r++}`,
            price: faker.commerce.price(),
        })
    }

    return generatedProducts;
}

// Ruta para Faker
app.get('/productos/test/:cant?', (req, res) => {

    let fakeProds
    if (req.params.cant != undefined) {
        fakeProds = genProducts(req.params.cant);
    } else {
        fakeProds = genProducts(5);
    }

    return res.render('index', {
        isTestView: true,
        fakeProds: fakeProds
    });
});

io.on('connection', (socket) => {
    console.log('Someone is connected');

    //funcion para leer todos los mensajes de la db y mostrarlos.
    function selectAllMessages() {
        Message.find().sort({
                'date': -1
            })
            .then(messages => {
                const parsedMessages = messages.map(function (m) {
                    return {
                        _id: m._id.toString(),
                        author: {
                            email: m.author.email,
                            name: m.author.name,
                            lastName: m.author.lastName,
                            age: m.author.age,
                            alias: m.author.alias,
                            avatar: m.author.avatar
                        },
                        text: m.text,
                        timeStamp: m.timeStamp
                    };
                })
                const normalizedMsgs = normalize(parsedMessages, [text]);
                //print(normalizedMsgs);
                console.log('Longitud antes de normalizar:', JSON.stringify(messages).length);
                console.log('Longitud después de normalizar:', JSON.stringify(normalizedMsgs).length);
                socket.emit('messages', {
                    messages: messages,
                    normalizedMsgs: normalizedMsgs,
                });
            })
            .catch(e => {
                console.log('Error getting messages: ', e);
            });
    }

    //funcion para leer todos los productos de la db y mostrarlos.
    function selectAllProducts() {
        prodsKnex.select('*').from('products')
            .then(products => {
                socket.emit('productCatalog', {
                    products: products,
                });
            })
            .catch(e => {
                console.log('Error getting products: ', e);
                prodsKnex.destroy();
            });
    }

    //Llamo a las funciones para que se muestren los mensajes y productos al levantar el servidor.
    selectAllMessages();
    selectAllProducts();

    socket.on('newProduct', newProd => {
        prodsKnex('products').insert(newProd)
            .then(() => {
                console.log('producto insertado');
                selectAllProducts()
                return false;
            })
            .catch(e => {
                console.log('Error en Insert producto: ', e);
            })
    });

    //Inserto un nuevo mensaje en la base de datos de mensajes.
    socket.on('newMsg', newMsg => {
        Message.create(newMsg)
            .then(() => {
                console.log('Mensaje insertado');
                selectAllMessages();
                return false;
            })
            .catch(e => {
                console.log('Error en Insert message: ', e);
            });
    });
});