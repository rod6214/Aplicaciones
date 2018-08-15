(function(extern, express, http, fs, path, bodyParser, ejs){
    
    var app = express();
    var server = http.Server(app);
    var mvcCore = function(){}
    
    mvcCore.prototype = {
        
        controllers:[],
        configPath: '',
        rootPath:'',
        host:'',
        port:'',
        url:'',
        _configLoadedEvent:null,
        config:null,
        
        setRootPath:function(rootPath){
            this.rootPath = rootPath;
        },
        
        setConfig: function(jsonFile){
            
            this.configPath = jsonFile; 
        },
        
        setControllers: function(){

            if(arguments.length > 0)
                for(var key in arguments)
                    this.controllers.push(arguments[`${key}`]);
        },

        configLoadedEvent: function(callback){
            this._configLoadedEvent = callback;
        },
        
        init: function(callback){
            fs.readFile(this.configPath, (err, data)=>{
                if(err) throw err;
                var config = JSON.parse(data);
                if(IsObjectEmpty(config)) throw 'config.json file is empty.';
                if(config.options === undefined)
                    throw 'config.options is undefined object.';
                if(IsObjectEmpty(config.options)) throw 'config.options is empty.';
                this.config = config;
                this.host = this.config.options.host;
                this.port = this.config.options.port;
                this.url = path.join(this.host, ':', this.port);
                InitConfiguration(/* config.config, this.rootPath */ this);
                Redirections('/', config.redirection); 
                // Redirections(config.redirection);
                // if(typeof this._configLoadedEvent === 'function')
                //     this._configLoadedEvent(this);
                for(var key in this.controllers)
                {
                    var controller = this.controllers[`${key}`];
                    controller.setHost(this.host);
                    controller.setPort(this.port);
                    controller.setApp(app);
                    if(controller.init === undefined)
                        throw 'init method must be implemented.'
                    if(typeof controller.init !== 'function')
                        throw 'init must be a function.';
                    controller.init();
                }
                // Redirections(config.redirection);
                ErrorRedirection(config.errorPath); 
                Listen(config.options, callback);
            });
        }
    };
    
    var util = mvcCore.prototype.util = {}
    
    var viewBase = mvcCore.prototype.viewBase = function(mainUrl){
        this.mainUrl = mainUrl;
    }

    var controllerBase = mvcCore.prototype.controllerBase = function(){
        this.host = null;
        this.port = null;
    }
    util.const = {};
    util.const.verbs = {GET:'GET', POST:'POST', PUT:'PUT', DELETE:'DELETE'};
    util.const.HTTP = 'http://';
    util.const.HTTPS = 'https://';
    util.getCurrentPath = function(){ return __dirname; }
    util.getJsonPath = function(){ return path.join(__dirname, 'config', 'config.json'); }
    util.sendToApi = function(view, fhost, fpath, fport, fmethod, callback){
        var apiReqOpts = {
            host:fhost,
            port:fport,
            method:fmethod,
            path:fpath,
            headers:{
                'Content-Type':'application/json'
            }
        };
        var req = http.request(apiReqOpts, (res)=>{
            res.on('data', (body)=>{
                if(callback != undefined && callback != null)
                    callback(JSON.parse(body));
            });
        });
        var validationModel = null;
        if(typeof view.req.body === 'object')
            validationModel = JSON.stringify(view.req.body);
        req.end(validationModel);
    }

    viewBase.prototype = {
        __data__:null,
        render:null,
        redirection:null,
        end:null,
        req:null,
        res:null,
        HTTP:'http://',
        HTTPS:null,
        getData:function(){
            return this.__data__;
        },
        setData:function(data){
            this.__data__ = data;
        }
    }
    
    controllerBase.prototype = {
        
        __app:null,
        getMainUrl:function(){
            return `${this.host}:${this.port}`;
        },
        setApp:function(tapp){
            this.__app = tapp;
        },
        setHost(host){ this.host = host;},
        setPort(port){ this.port = port;},
        
        get:function(lPath, callback){
            var view = new viewBase(this.getMainUrl());
            this.__app.get(lPath, (req, res)=>{
                ViewProcessor(view, req, res, callback, this);
            });
        },
        post:function(lPath, callback){
            var view = new viewBase(this.getMainUrl());
            this.__app.post(lPath, (req, res)=>{
                ViewProcessor(view, req, res, callback, this);
            });
        },
        put:function(lPath, callback){
            var view = new viewBase(this.getMainUrl());
            this.__app.put(lPath, (req, res)=>{
                ViewProcessor(view, req, res, callback, this);
            });
        },
        delete:function(lPath, callback){
            var view = new viewBase(this.getMainUrl());
            this.__app.delete(lPath, (req, res)=>{
                ViewProcessor(view, req, res, callback, this);   
            });
        },
    }

    function ViewProcessor(view, req, res, callback, sender){
        view.req = req;
        view.res = res;
        callback(view);
        ViewReturnedData(view, sender);
    }

    function ViewReturnedData(view, sender){
        if(view.render != null)
            view.res.render(view.render, {data:view.getData(), url:sender.getMainUrl()});
        else if(view.redirection != null)
            view.res.redirect(view.HTTP+view.mainUrl+'/'+view.redirection);
        else if(view.end != null)
            view.res.end(view.end);
    }
    
    function Listen(options, callback){
        if(options === null)
            throw 'options is null';
        if(IsObjectEmpty(options))
            throw 'options is empty at least a port is required';
        if(options.port === undefined)
            throw 'options.port is undefined.';
        if(options.port === '')
            throw 'a port number is required.';
        server.listen(options, callback);
    }
    
    function IsObjectEmpty(obj){ return JSON.stringify(obj) === '{}'}
    
    function InitConfiguration(/* config, rootPath */ sender){
        if(sender === undefined)
            throw 'Param in InitConfiguration is undefined.';
        var config = sender.config.config;
        if(config === null)
            throw 'config property is null review json file';
        if(IsObjectEmpty(config))
            throw 'config property is empty review json file';
        if(config.staticPath === undefined)
            throw 'config.staticPath is not defined';
        if(config.viewsPath === undefined)
            throw 'config.viewsPath is not defined';
        if(config.viewAlias === undefined)
            throw 'config.viewAlias is not defined';
        //console.log(path.join(sender.rootPath,'./', config.staticPath));
        app.use(bodyParser.json());
        app.use(express.static(path.join(sender.rootPath,'./', config.staticPath)));
        app.use(bodyParser.urlencoded({ extended: true}));
        app.set(config.viewAlias, path.join(sender.rootPath, './', config.viewsPath));
        app.set('view engine', 'ejs');
        app.engine('html', ejs.renderFile);
    }
    
    function Redirections(root, redirection){
        app.get(root, function(req, res){
            res.redirect(redirection);
        });
    }
    
    function ErrorRedirection(errorPath){
        app.use(function(req, res, next){
            console.log('Error la pagina no se encuentra');
            res.status(404).render('error/index.ejs', {url:'http://localhost:3030'});
        });
    }
    
    extern.mvc = new mvcCore;
    
})(module.exports,
   require('express'),
   require('http'),
   require('fs'),
   require('path'),
   require('body-parser'),
   require('ejs')
  );

