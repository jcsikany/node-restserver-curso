//Vamos a crearnos una funcion q va a verificar el token

const jwt = require('jsonwebtoken');

// ===============================
// Verificar Token
// ===============================
let verificaToken = ( req, res, next ) => {

    
    //De esta manera leemos el header con req.get
    //'Authorization' es el nombre q le pusimos en el header para el token.
    let token = req.get('Authorization');

    //la funcion verify es de jwt, le pasamos el token q sacamos del header, el process.env.SEED q es el string q creamos para darle mas seguridad
    //que sirve para verificar el token y dsp un callback q nos devuelve err(si expiro el token, si no es valido, o cualquier otra cosa)
    //y decoded q es todo el payload o sea adentro esta la informacion del usuario. Video 115
    jwt.verify( token, process.env.SEED, (err, decoded) => {

        if ( err ){
            return res.status(401).json({
                ok:false,
                err: {
                    message: 'Token no valido'
                }
            })
        }

        //obtenemos el usuario a traves del decoded q seria el payload.
        req.usuario = decoded.usuario


        //Si no ejecutamos el next jamas se va a ejecutar todo lo q siga dsp d este token.
        //o sea q cuando lo usemos en el get no se va a ejecutar el codigo de error o res.
        //lo ejecutamos aca dentro para q se ejecute si paso estas verificaciones.
        next();

    });
    

};

// ===============================
// Verificar AdminRole
// ===============================
let verificaAdmin_Role = ( req, res, next ) => {

    let usuario = req.usuario;

    if ( !(usuario.role === 'ADMIN_ROLE')){

        return res.json({
            ok:false,
            err:{
                message: 'No tienes permiso de Administrador.'
            }
        })
    }    

    next();

}


module.exports = {    
    verificaToken,
    verificaAdmin_Role
}