
module.exports.loginController = function(app){
    
    //Request login view
    app.get('/views/login', (req, res) => {
        
        res.render('login/index.ejs');
    });
    //Request login access
    app.post('/views/login', (req, res) =>{
        
        var post_data = JSON.stringify({
            'id':'0',
            'usuario':req.body.usuario,
            'pass':req.body.pass,
            'urole':req.body.role,
            'isonline':'false'
        });
        
        var post_options = {
            host:'localhost',
            port:51671,
            path:'/api/usuarios',
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
        
        var post_req = http.request(post_options, (response) => {
            
            response.on('data', (chunk) => {
                
                console.log(`response: ${chunk}`);
            });
        });
        
        console.log(post_data);
        post_req.write(post_data);
        post_req.end();
        
        res.redirect('/views/usuario');
    });
}