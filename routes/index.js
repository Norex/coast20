var twitter = require('../twitter');
var nconf = require('nconf');

exports.index = function(req, res) {
  res.render('index', { currentKeyword: nconf.get('KEYWORD'), isHistoryPage: false });
};

exports.history = function(req, res, io) {
  res.render('history', { currentKeyword: nconf.get('KEYWORD'), isHistoryPage: true });
};

exports.getHistory = function(req, res, io) {
  req.app.get('db').collection('tweets', function(err, collection) {
    if (err) { throw err; }

    collection.find().toArray(function(err, items) {
      if (err) { throw err; }

      res.json(items);
    });
  });

};

exports.getRecentHistory = function(req, res, io) {
  req.app.get('db').collection('tweets', function(err, collection) {
    if (err) { throw err; }

    collection.find({}, { limit: 50 }).sort({ _id: -1 }).toArray(function(err, items) {
      if (err) { throw err; }

      res.json(items);
    });
  });

};