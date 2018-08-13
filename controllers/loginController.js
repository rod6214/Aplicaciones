var core = require('../server/mvcjs/mvcjs.js');
var mvc = core.mvc;

var loginController =  function(){}

loginController.prototype = new mvc.controllerBase;

loginController.prototype.init = function(){
    this.get('/views/login', 'login/index.ejs', GetPage);
    this.post('/views/login', '');
}

function GetPage(view){
    // console.log(clearCookie);
    console.log(view.res.cookie);
    // console.log(view.__proto__);
}

module.exports = function(){
    return new loginController();
}