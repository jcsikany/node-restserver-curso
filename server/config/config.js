

//process es una objeto q esta corriendo a lo largo de toda la aplicacion
//Este objeto es actualizado dependiendo del environment o entorno donde esta corriendo.
// ====================
// Puerto
// ====================
process.env.PORT = process.env.PORT || 3000;


// ====================
// Entorno
// ====================
//Esto me sirve para saber si estoy en desarrollo o en produccion "process.env.NODE_ENV" esto es una variable q establece heroku
//esto lo q me dice q es si esa variable(process.env.NODE_ENV) no existe entonces voy a suponer q estoy en desarrollo (dev)
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'


// ====================
// Base de datos
// ====================
let urlDB;


// ====================
// Vencimiento del token
// ====================
//60 segundo
//60 minutos
//34 horas
//30 dias
process.env.CADUCIDAD_TOKEN = '48h';


// ====================
// SEED de autenticacion  //semilla de autenticacion
// ====================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';






//si esta variable es igual a desarrollo(dev) voy a decirle q el url es el localhost
if ( process.env.NODE_ENV === 'dev' ) {
    urlDB = 'mongodb://localhost:27017/cafe'; //Esta es la url local
}else{
    urlDB = process.env.MONGO_URI; //La variable de entorno MONGO_URI la cree con  (heroku config:set MONGO_URI="mongodb://cafe-user:pekyyrufy21@ds151840.mlab.com:51840/cafe")
    //urlDB = 'mongodb://cafe-user:pekyyrufy21@ds151840.mlab.com:51840/cafe'; //Esta es la url remota q nos da Mlab
          // mongodb://<dbuser>:<dbpassword>@ds151840.mlab.com:51840/cafe  Hay q cambiarle por el nombre de usuario y la contraseña
}

process.env.URLDB = urlDB;



// ====================
// Google Client ID
// ====================

process.env.CLIENT_ID = process.env.CLIENT_ID || '850150703806-fc65e29p84k3h6l9j8ps8hm2hhtor3es.apps.googleusercontent.com';