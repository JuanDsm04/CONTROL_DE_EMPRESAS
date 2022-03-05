const Usuarios = require('../models/usuario.model');

const Empleados = require('../models/empleado.model');
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt');


/* ADMINISTRADOR DEFAULT */
function administradorDefault(){
    Usuarios.find({usuario:'Admin'}, (err, administradorEncontrado)=>{
        if(administradorEncontrado == 0){
            bcrypt.hash('123456', null, null, (err, passwordEncriptada)=>{
                Usuarios.create({
                    nombre: null,
                    usuario: 'Admin',
                    rol: 'ROL_ADMINISTRADOR',
                    password: passwordEncriptada
                })
            });
        }
    });
}


/* LOGIN */
function Login(req, res){
    var parametros = req.body;
    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEncontrado) => {
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(usuarioEncontrado){

            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword) => {
                    if (verificacionPassword){
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                            .send({token: jwt.crearToken(usuarioEncontrado)});
                        } else{
                            usuarioEncontrado.password = undefined;
                            return res.status(200)
                            .send({usuario: usuarioEncontrado});
                        }
                        
                    }else{
                        return res.status(500)
                        .send({mensaje: 'Las contrasenas no coincide'});
                    }
                })

        }else{
            return res.status(500).send({mensaje: 'Error el usuario no se encuentra registrado'});
        }
    })
}


/* REGISTRAR EMPRESA */
function RegistrarEmpresa(req, res){
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede elegir el id'});
    }

    if (parametros.rol != null){
        return res.status(500).send({ mensaje: 'No se puede elegir el rol'});
    }

    if(req.user.rol == 'ROL_ADMINISTRADOR'){

        if(parametros.nombre && parametros.usuario && parametros.password){
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.usuario = parametros.usuario;
            usuarioModel.rol = 'ROL_EMPRESA';
            usuarioModel.password = parametros.password;
            
            Usuarios.find({usuario: parametros.usuario}, (err, empresaEncontrada)=>{
                if (empresaEncontrada.length == 0){
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada)=>{
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, empresaGuardada)=>{
                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                            if(!empresaGuardada) return res.status(500).send({mensaje: 'Error al agregar la Empresa'});
        
                            return res.status(200).send({empresa: empresaGuardada});
                        });
                    })
                }else{
                    return res.status(500).send({mensaje:'Este usuario de empresa ya existe'});
                }
            })
        }else{
            return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"});
        }
    }else{
        return res.status(500).send({mensaje:'Solo el administrador puede crear una nueva empresa.'});
    }
}


/* EDITAR EMPRESA */
function EditarEmpresa(req, res){
    var idEmpre = req.params.idEmpresa;
    var parametros = req.body;

    if (parametros._id != null){
        return res.status(500).send({ mensaje: 'No se puede editar el id'});
    }

    if (parametros.rol != null){
        return res.status(500).send({ mensaje: 'No tiene autorizado el editar el rol'});
    }

    if (parametros.password != null){
        return res.status(500).send({ mensaje: 'No tiene autorizado el editar la password'});
    }

    if (parametros.usuario != null){
        Usuarios.find({usuario: parametros.usuario}, (err, empresaEncontrada)=>{
            if (empresaEncontrada.length == 0){
                if ( req.user.rol != 'ROL_ADMINISTRADOR' ){
                    if ( req.user.rol == 'ROL_EMPRESA' ){
                        if ( req.user.sub != idEmpre ){
                            return res.status(500).send({ mensaje: 'No tiene autorizado el editar a las demas empresas'});
                        }else{
                            Usuarios.findByIdAndUpdate(idEmpre, parametros, {new : true},(err, usuarioActualizado)=>{
                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar la Empresa'});
                                
                                return res.status(200).send({usuario : usuarioActualizado})
                            })
                        }
                    }
                }else{
                    if ( req.user.rol == 'ROL_ADMINISTRADOR' ){
                        Usuarios.findByIdAndUpdate(idEmpre, parametros, {new : true},(err, usuarioActualizado)=>{
                            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                            if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar la Empresa'});
                            
                            return res.status(200).send({usuario : usuarioActualizado})
                        })
                    }
                }
                
            }else{
                return res.status(500).send({mensaje:'Este usuario de empresa ya existe'});
            }
        })
    }else{
        if ( req.user.rol != 'ROL_ADMINISTRADOR' ){
            if ( req.user.rol == 'ROL_EMPRESA' ){
                if ( req.user.sub != idEmpre ){
                    return res.status(500).send({ mensaje: 'No tiene autorizado el editar a las demas empresas'});
                }else{
                    Usuarios.findByIdAndUpdate(idEmpre, parametros, {new : true},(err, usuarioActualizado)=>{
                        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                        if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar la Empresa'});
                        
                        return res.status(200).send({usuario : usuarioActualizado})
                    })
                }
            }
        }else{
            if ( req.user.rol == 'ROL_ADMINISTRADOR' ){
                Usuarios.findByIdAndUpdate(idEmpre, parametros, {new : true},(err, usuarioActualizado)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al editar la Empresa'});
                    
                    return res.status(200).send({usuario : usuarioActualizado})
                })
            }
        }
    }

    
}


/* ELIMINAR EMPRESA */
function EliminarEmpresa (req, res){
    var idEmpre = req.params.idEmpresa;

    if ( req.user.rol != 'ROL_ADMINISTRADOR' ){
        if ( req.user.rol == 'ROL_EMPRESA' ){
            if ( req.user.sub != idEmpre ){
                return res.status(500).send({ mensaje: 'No tiene autorizado el eliminar a las demas empresas'});
            }else{
                Usuarios.findByIdAndDelete(idEmpre, (err, empresaEliminada)=>{
                    if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
                    if (!empresaEliminada) return res.status(404).send ({mensaje: 'Error al eliminar la empresa'});
            
                    Empleados.find({ idEmpresa : req.user.sub }, (err, empleadosObtenidos) => {
                        for(let i = 0; i < empleadosObtenidos.length; i++){
                            Empleados.findOneAndDelete({idEmpresa:idEmpre, idEmpresa: req.user.sub},(err, empleadoEliminado) => {
                                if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
                                if (!empleadoEliminado) return res.status(404).send ({mensaje: 'Ocurrio un error o intento eliminar a un empleado que no le pertenece'});
                            })
                        }
                    })
                    return res.status(200).send({empresa: empresaEliminada});
                })
            }
        }
    }else{
        if ( req.user.rol == 'ROL_ADMINISTRADOR' ){
            Usuarios.findByIdAndDelete(idEmpre, (err, empresaEliminada)=>{
                if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
                if (!empresaEliminada) return res.status(404).send ({mensaje: 'Error al eliminar la empresa'});
        
                Empleados.find({ idEmpresa : idEmpre }, (err, empleadosObtenidos) => {
                    for(let i = 0; i < empleadosObtenidos.length; i++){
                        Empleados.findOneAndDelete({idEmpresa:idEmpre, idEmpresa: idEmpre},(err, empleadoEliminado) => {
                            if(err) return res.status(500).send ({mensaje: 'Error en la peticion'});
                            if (!empleadoEliminado) return res.status(404).send ({mensaje: 'Ocurrio un error'});
                        })
                    }
                })
                return res.status(200).send({empresa: empresaEliminada});
            })
        }
    }
}


module.exports = {
    administradorDefault,
    Login,
    RegistrarEmpresa,
    EditarEmpresa,
    EliminarEmpresa
}