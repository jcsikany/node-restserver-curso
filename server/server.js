// Como es este el primer archivo cuando empieza a ejecutar nuestra aplicacion va a leer 
//este archivo(config.js) y lo va aejecutar, al ejecutarlo me va a configurar todo lo q el contenga.
require('./config/config');


const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

 
app.get('/usuario', (req, res) => {
  res.json('get usuario')
})

app.post('/usuario', (req, res) => {

    // el body q esta en req.body es el q va a aparecer cuando el bodyparser procese cualquier payload
    // que reciban las peticiones.
    let body = req.body;

    if( body.nombre === undefined ) {

        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
        
    }else{
        
        res.json({
            persona: body
        })
    }

})

app.put('/usuario/:id', (req, res) => {

    let id = req.params.id;

    res.json({
        id
    });
})

app.delete('/usuario', (req, res) => {
    res.json('delete usuario')
})
 
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
})