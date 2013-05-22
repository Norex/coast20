var twitter = require('../twitter');

exports.index = function(req, res){
  res.render('index', { currentKeyword: twitter.currentKeyword() });
};