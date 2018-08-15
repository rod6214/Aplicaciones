var core = require('../server/mvcjs/mvcjs.js');
var mvc = core.mvc;

var loginController =  function(){}

loginController.prototype = new mvc.controllerBase;

loginController.prototype.init = function(){
    this.get('/views/login', LoginPage);
    this.post('/views/login', LoginResult);
}

function LoginPage(view){
    view.render = 'login/index.ejs';
}

function LoginResult(view){
    view.redirection = 'views/login';
}

module.exports = function(){
    return new loginController();
}