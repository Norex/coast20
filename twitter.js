var Twit = require('twit'),
    nconf = require('nconf');

var twit = new Twit({
    consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
    consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
    access_token: nconf.get('TWITTER_ACCESS_TOKEN'),
    access_token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
});

var tweetStream = false,
    currentlySelectedKeyword = false;

module.exports.currentKeyword = function() {
  return currentlySelectedKeyword;
};

module.exports.run = function(keyword, io) {
  if (tweetStream)
    tweetStream.stop();

  currentlySelectedKeyword = keyword;
  io.sockets.emit('switched_keyword', keyword);

  tweetStream = twit.stream('statuses/filter', { track: keyword });
  tweetStream.on('tweet', function (tweet) {
    io.sockets.emit('twitter', tweet);
  });

  tweetStream.on('limit', function (limitMessage) {
    console.log('Limited by Twitter streaming API');
  });

  tweetStream.on('disconnect', function (disconnectMessage) {
    console.log('Disconnected: ' + disconnectMessage);
  });

  tweetStream.on('connect', function (request) {
    console.log('Connected to Twitter streaming API');
  });

  tweetStream.on('reconnect', function (request, response, connectInterval) {
    console.log('Reconnected to Twitter streaming API');
  });

  return keyword;
};

