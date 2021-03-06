var express = require('express'),
mongoose = require('mongoose').Mongoose,
db = mongoose.connect('mongodb://localhost/todo'),
io = require('socket.io'),
node = require('nodestream'),
connections = 0;

// model
mongoose.model('Item', {
  
    properties: ['title', 'description', 'due', ['tags']],
  
    getters: {
        id: function(){
            return this._id.toHexString();
        },
    
        description_formatted: function(v){
            return this.description ? '<p>' + this.description.replace(/\n/g, '</p><p>') + '</p>' : '';
        }
    }
  
});

// app initialization
var app = express.createServer(
    //express.staticProvider(__dirname + '/public'),
    express.bodyDecoder(),
    express.cookieDecoder(),
    express.session()
    );

app.configure(function(){
    Item = db.model('Item');
    app.use(app.router);
    app.use(express.staticProvider(__dirname + '/public'));
});

// routes
app.get('/', function(req, res){
    console.log('intercepting / request');

    Item.find({}).sort([['_id', -1]]).all(function(items){
        res.render('index.jade', {
            locals: {
                items: items,
                connections: connections
            },
            layout: false
        });
    });
  
});

app.get('/edit/:id', function(req, res){

    Item.findById(req.param('id'), function(item){
        if (!item) return res.send(404);
        res.render('edit.jade', {
            locals: {
                item: item
            },
            layout: false
        });
    });
  
});

app.post('/edit/:id', function(req, res){
  
    Item.findById(req.param('id'), function(item){
        if (!item) return res.send(404);
        item.title = req.body.title;
        item.due = req.body.due;
        item.description = req.body.description;
        item.save(function(){
            nodestream.emit('item.edit.' + item.id, item);
            res.send(200);
        });
    });
  
});

app.post('/add', function(req, res){
  
    var item = new Item();
    item.merge(req.body);
    item.save(function(){
        nodestream.emit('item.new', item);
        res.send(200);
    });
  
});

app.get('/delete/:id', function(req, res){
  
    Item.findById(req.param('id'), function(item){
        if (!item) return res.send(404);
        item.remove(function(){
            nodestream.emit('item.remove.' + item.id);
            res.send(200);
        });
    });
  
});

app.listen(8081);

var nodestream = io.listen(app).nodestream()
.on('connect', function(){
    connections++;
    this.emit('connections', connections);
})
.on('disconnect', function(){
    connections--;
    this.emit('connections', connections);
});
  
process.on('uncaughtException', function(e){
    console.error(e.stack || e);
});

console.log('Server running at http://127.0.0.1:8081/');
