var nconf = require('nconf');
nconf.argv().env().file({ file: './config.json' });

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    twitter = require('./twitter'),
    socketIo = require('socket.io'),
    mongodb = require('mongodb');

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
if ('development' == app.get('env'))
  app.use(express.errorHandler());

var server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

var db = new mongodb.Db(nconf.get('MONGODB_NAME'), new mongodb.Server(nconf.get('MONDODB_SERVER'), nconf.get('MONDODB_PORT'), {}));
db.open(function (err, db) {
  if (err) { throw err; }

  db.authenticate(nconf.get('MONDODB_USERNAME'), nconf.get('MONDODB_PASSWORD'), function (err, replies) {
    if (err)
      throw err;

    app.set('db', db);

    app.get('/', routes.index);
    app.get('/history', routes.history);
    app.get('/hashpipe', routes.history);
    app.get('/gethistory', routes.getHistory);
    app.get('/getrecenthistory', routes.getRecentHistory);

    var io = socketIo.listen(server);
    twitter.run(nconf.get('KEYWORD'), io, app);
  });
});
