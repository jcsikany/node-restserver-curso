// Como es este el primer archivo cuando empieza a ejecutar nuestra aplicacion va a leer 
//este archivo(config.js) y lo va aejecutar, al ejecutarlo me va a configurar todo lo q el contenga.
require('./config/config');


const express = require('express');
const mongoose = require('mongoose');
 

const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.use( require('./routes/usuario') );



mongoose.connect(process.env.URLDB, (err,res) => {

    if ( err ) throw err;

    console.log('Base de datos ONLINE');

});


 
app.listen(process.env.PORT, () => {
    console.log('Escuchando el puerto: ', process.env.PORT);
})