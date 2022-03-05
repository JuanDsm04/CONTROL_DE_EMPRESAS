const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const UsuariosSchema = Schema({
    nombre: String,
    usuario: String,
    rol: String,
    password: String
});

module.exports = mongoose.model('usuarios', UsuariosSchema);