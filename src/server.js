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


//MessagesDB
const msgOptions = require('./options/sqlite3');
const msgKnex = require('knex')(msgOptions);

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

io.on('connection', (socket) => {
    console.log('Someone is connected');

    //funcion para leer todos los mensajes de la db y mostrarlos.
    function selectAllMessages() {
        msgKnex.select('*').from('messages').orderBy('date', 'desc')
            .then(messages => {
                if (messages.length > 0) {
                    socket.emit('messages', {
                        messages: messages
                    });
                } else {
                    socket.emit('messages', {
                        messages: []
                    });
                }
            })
            .catch(e => {
                console.log('Error getting messages: ', e);
                msgKnex.destroy();
            })
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
        msgKnex('messages').insert(newMsg)
            .then(() => {
                console.log('Mensaje insertado');
                selectAllMessages();
                return false;
            })
            .catch(e => {
                console.log('Error en Insert message: ', e);
            })
    });
});