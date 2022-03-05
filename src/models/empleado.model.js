const mongoose = require ('mongoose');
var Schema = mongoose.Schema;

const EmpleadosSchema = Schema({
    nombre: String,
    puesto: String,
    departamento: String,
    idEmpresa: {type: Schema.Types.ObjectId, ref: 'empresas'}
});

module.exports = mongoose.model('empleados', EmpleadosSchema);