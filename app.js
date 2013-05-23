var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json' });

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    twitter = require('./twitter'),
    socketIo = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);



app.set('db', db);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var mongodb = require('mongodb');
var db = new mongodb.Db('nodejitsu_norex_nodejitsudb304707281',
  new mongodb.Server('ds059907.mongolab.com', 59907, {})
);
db.open(function (err, db) {
  if (err) { throw err; }
  db.authenticate('nodejitsu_norex', 'v814g6c2ur4msssjifst5s2e5h', function (err, replies) {
    if (err) { throw err; }

    var io = socketIo.listen(server);
    app.set('db', db);
    twitter.run(nconf.get('KEYWORD'), io, app);
  });
});
// var io = socketIo.listen(server);
// twitter.run(nconf.get('KEYWORD'), io, app);