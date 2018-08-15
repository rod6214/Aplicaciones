var core = require('../server/mvcjs/mvcjs.js');
var mvc = core.mvc;

var usuarioController =  function(){}

usuarioController.prototype = new mvc.controllerBase;

usuarioController.prototype.init = function(){
    this.get('/views/usuario', '', GetAll);
}

function GetAll(view){
    view.render = 'usuario/index.ejs';
}

module.exports = function(){
    return new usuarioController();
}