(function($) {
  $(document).ready(function() {

    // Hand keyword submission to changed tracked keyword.
    $('#keyword-form').submit(function(){
      $.post("", { keyword: $('#keyword').val(), time: "2pm" } );
      $('#keyword').val('');
      return false;
    });

    var socket = io.connect(window.location.hostname),
        keyword = window.currentKeyword,
        tweets = [];
    if (window.isHistoryPage) {
      $.get('/gethistory', function(data) {
        for (var i = 0; i < data.length; i++)
          processTweet(data[i]);
      });
    }
    else {
      $.get('/getrecenthistory', function(data) {
        data = data.reverse();
        for (var i = 0; i < data.length; i++) {
          console.log(data[i]);
          processTweet(data[i]);
        }

        socket.on('twitterLive', function(tweetData) {
          processTweet(tweetData);
        });
      });
    }

    var parse_tweet = function (str) {
      var create_link = function (url, text) {
        var link = $("<a>", {
          text: text,
          href: url,
          target: "_blank"
        });

        return link.prop('outerHTML');
      };

      // parse URLs
      str = str.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function (s) {
        return create_link(s, s);
      });

      // parse username
      str = str.replace(/[@]+[A-Za-z0-9_]+/g, function (s) {
        return create_link("http://twitter.com/" + s.replace('@', ''), s);
      });

      // parse hashtags
      str = str.replace(/[#]+[A-Za-z0-9_]+/g, function (s) {
        return create_link("http://search.twitter.com/search?q=" + s.replace('#', ''), s);
      });

      return str;
    };

    var tweetText= function(data) {
      if (typeof data.retweeted_status != 'undefined') {
        var retweetedUser = data.retweeted_status.user.screen_name;
        var retweetedUserProfileUrl = 'http://twitter.com/' + data.retweeted_status.user.screen_name;
        var tweetText = 'RT @' + retweetedUser + ': ' + data.retweeted_status.text;
        
        return parse_tweet(tweetText.replace(new RegExp('(^|[^\\w\\d#])(' + keyword + ')(\\b|$)','ig'), '$1<strong>$2</strong>$3'));
      }
      else {
        return parse_tweet(data.text.replace(new RegExp('(^|[^\\w\\d#])(' + keyword + ')(\\b|$)','ig'), '$1<strong>$2</strong>$3'))
      }
    };

    var processTweet = function(data) {
      picTwitter = scrapePicTwitter(data);
      twitpic = scrapeTwitPic(data);
      instagram = scrapeInstagram(data);
      vine = scrapeVine(data);

      var new_picture = $('<div class="row"><div class="span12"><blockquote class="tweet">' + picTwitter + twitpic + instagram + vine + '<img class="profile" src="' + data.user.profile_image_url + '"/><p>' + tweetText(data) + '</p><small>' + data.user.screen_name + '</small></p></blockquote></div></div>');

      new_picture.find('img.picture').error(function () {
        $(this).hide();
      });

      $('#tweets').prepend(new_picture);
      if (!window.isHistoryPage)
        $('#tweets > div').slice(50).remove();
    };

    var scrapeVine = function(data) {
      var output = '';
      try{
        for(var i=0; i<data.entities.urls.length; i++){
          if(/vine\.co\//.test(data.entities.urls[i].display_url)){
            output += '<div class="picture-container"><iframe class="vine-embed" src="' + data.entities.urls[i].expanded_url + '/embed/simple" width="480" height="480" frameborder="0"></iframe><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script></div>';
          }
        }
      }
      catch(e){ }

      return output;
    };

    var scrapePicTwitter = function(data) {
      var output = '';
      try{
        for(var i=0; i<data.entities.media.length; i++) {
          output += formatPhoto(data.entities.media[i].media_url + ':large', 'pic-twitter');
        }
      }
      catch(e){ }

      return output;
    };

    var scrapeTwitPic = function(data){
      var output = '';
      try{
        for(var i=0; i<data.entities.urls.length; i++){
          if(/twitpic\.com\//.test(data.entities.urls[i].display_url)){
            var pic = data.entities.urls[i].display_url.replace(/^twitpic\.com\/([a-zA-Z0-9]+)\/*.*/, "$1");
            output += formatPhoto('http://twitpic.com/show/large/' + pic, 'pic-twitpic');
          }
        }
      }
      catch(e){ }

      return output;
    };

    var scrapeInstagram = function(data){
      var output = '';
      try{
        for(var i=0; i<data.entities.urls.length; i++){
          if(/instagram\.com\//.test(data.entities.urls[i].display_url)){
            var pic = data.entities.urls[i].display_url.replace(/^instagram\.com\/p\/([a-zA-Z0-9_]+)\/*.*/, "$1");
            output += formatPhoto('http://instagram.com/p/' + pic + '/media?size=l', 'pic-instagram');
          }
        }
      }
      catch(e){ }

      return output;
    };

    var formatPhoto = function(photo_url, html_class){
      return '<div class="picture-container"><img class="picture ' + html_class + '" src="' + photo_url + '" /></div>';
    };
  });
})(jQuery);