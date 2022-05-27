const socket = io();

socket.on('productCatalog', (productsData) => renderProducts(productsData));
let renderProducts = (productsData) => {
    if (productsData.products.length > 0) {
        //Productos
        let htmlProductos = productsData.products.map(e => `
        <div class="row product">
            <div class="col">${e.title}</div>
            <div class="col">$ ${e.price}</div>
            <div class="col-3"><img src="${e.thumbnail}" alt="" width="60" height="60"></div>
        </div>`
        ).join(' ');

        document.getElementById('viewTitle').innerHTML = productsData.viewTitle;
        document.getElementById('productCatalog').innerHTML = htmlProductos;
    } else {
        let html = `<div class="error" style="padding:2em;text-align:center">${data.errorMessage}</div>`;
        document.getElementById('productCatalog').innerHTML = html;
    }
}

socket.on('messages', (messagesData) => renderMessages(messagesData));
let renderMessages = (messagesData) => {
    //Mensajes
    let htmlMensajes = messagesData.messages.map((e, i) => `
    <div class="row" style="margin: 2em">
    <div class="col-1">
        <img src="${e.author.avatar}" alt="" width="60" height="60">
        </div>
        <div class="col-4">
        <strong style="color: blue; font-size: 20px">${e.author.email}</strong>
        <br>
        <em style="color: black; font-size: 12px">${e.timeStamp}</em>
        </div>
        <div class="col-5">
        <em style="color: black; font-size: 20px; padding:0.5em">- ${e.text}</em>
        </div>     
    </div>`).join(' ');
    document.getElementById('messages').innerHTML = htmlMensajes;
}

function createProd(form) {
    console.log("Nuevo producto agregado!");
    let newProduct = {
        title: document.getElementById('title').value,
        price: parseFloat(document.getElementById('price').value),
        thumbnail: document.getElementById('thumbnail').value
    }
    socket.emit('newProduct', newProduct)
    console.log(newProuct);
    return false;
}

function sendMsg(form) {
    let fullMsg = {
        author: {
            email: document.getElementById('email').value,
            name: document.getElementById('name').value,
            lastName: document.getElementById('lastName').value,
            age: document.getElementById('age').value,
            alias: document.getElementById('alias').value,
            avatar: document.getElementById('avatar').value
        },
        text: document.getElementById('text').value
    }
    socket.emit('newMsg', fullMsg)
    console.log(fullMsg);
    return false;
}



