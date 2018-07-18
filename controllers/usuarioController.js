var core = require('../server/mvcjs/mvcjs.js');
var mvc = core.mvc;

var usuarioController =  function(){}

usuarioController.prototype = new mvc.controllerBase;

usuarioController.prototype.init = function(){
    this.get('/views/usuario', 'usuario/index.ejs', GetAll);
}

function GetAll(view){
    console.log(view.__proto__);
}

module.exports = function(){
    return new usuarioController();
}