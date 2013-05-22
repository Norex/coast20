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
    socket.on('twitter', function(data) {
      processTweet(data);
    });

    var processTweet = function(data) {
      picTwitter = scrapePicTwitter(data);
      twitpic = scrapeTwitPic(data);
      instagram = scrapeInstagram(data);
      vine = scrapeVine(data);

      var new_picture = $('<div class="row"><div class="span12"><blockquote class="tweet">' + picTwitter + twitpic + instagram + vine + '<img class="profile" src="' + data.user.profile_image_url + '"/><p>' + data.text.replace(new RegExp('(^|[^\\w\\d#])(' + keyword + ')(\\b|$)','ig'), '$1<strong>$2</strong>$3') + '</p><small>' + data.user.screen_name + '</small></p></blockquote></div></div>');

      new_picture.find('img.picture').error(function () {
        $(this).hide();
      });

      $('#tweets').prepend(new_picture);
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
            var pic = data.entities.urls[i].display_url.replace(/^instagram\.com\/p\/([a-zA-Z0-9]+)\/*.*/, "$1");
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