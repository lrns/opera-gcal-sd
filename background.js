jQuery.support.cors = true;
console={log:function(m){window.opera.postError(m)}}


  function updateTile() {
    console.log('https://www.google.com/calendar/feeds/default/private/embed?toolbar=true&max-results=10');
    //xhr.setRequestHeader("Authorization","GoogleLogin auth=" + getUserAuth())
    $.ajax({
      //url: 'http://www.reddit.com/r/earthporn/.json', 
      url: 'https://www.google.com/calendar/feeds/default/private/embed?toolbar=true&max-results=10', 
      dataType: 'text',
      headers: {"Authorization" : "GoogleLogin auth=" + getUserAuth()},
      error: function(jqXHR, textStatus, errorThrown) {
		console.log('jqXHR:' + jqXHR);
		console.log('textStatus:' + textStatus);
		console.log('error:' + errorThrown);
      },
      success: function(data) {
		console.log(data);
        /*if (!data || !data.data || !data.data.children) return;
        var i = 0;
        var imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?/;
        while (!data.data.children[i].data.url.match(imageRegex)) i++;
        var firstPost = data.data.children[i].data;
        var imageUrl = firstPost.url;

        if (imageUrl.match(/imgur/)) {
          var formatMatch = imageUrl.match(/\.(?:(jpg|gif|png))/);
          imageUrl = imageUrl.replace(/\.(?:jpg|gif|png)/, 'l.' + formatMatch[1]);
        }
*/
        $('#sdtxt').html(data);
        opera.contexts.speeddial.title = firstPost.title;
      }
    });
  }

