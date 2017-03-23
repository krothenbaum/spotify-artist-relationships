var ARTISTS = [];
var ARTISTIDS = [];
var AUDIOOBJ = new Audio();


//Search user submitted artist by name. Use top search result. Search recommended artists for user input.
function searchArtistByName(artistName, degree) {
  var artistPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: artistName,
      type: 'artist'
    }}));    
    artistPromise.then(function (response) {
      ARTISTIDS.push(response.artists.items[0].id);
      // check if artist has image if not assign placeholder
      if (response.artists.items[0].images.length > 0) {
        ARTISTS.push({'name': response.artists.items[0].name, 'artistId': response.artists.items[0].id, 'imageURL': response.artists.items[0].images[0].url});
      } else {
        ARTISTS.push({'name': response.artists.items[0].name, 'artistId': response.artists.items[0].id, 'imageURL': 'images/spotify.png'});
      }
      searchRecommendations(response.artists.items[0].id, degree);
    }, function (error) {
        console.error('uh oh: ', error);   // 'uh oh: something bad happened’
    });
}

//Search artists by Spotify Id and then search the related artists for each artist
function searchArtistById(artistId, degree) {
  var artistIdPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/artists/' + artistId,
    }));    
    artistIdPromise.then(function (response) {
      if (ARTISTIDS.indexOf(this.id) == -1) {
        ARTISTIDS.push(response.id);
        if (response.images.length > 0) {
          ARTISTS.push({'name': response.name, 'artistId': response.id, 'imageURL': response.images[0].url});
        } else {
          ARTISTS.push({'name': response.name, 'artistId': response.id, 'imageURL': 'images/spotify.png'});
        }
        searchRecommendations(response.id, degree);
      }
    }, function (error) {
        console.error('uh oh: ', error);   // 'uh oh: something bad happened’
    });
}

//Search for related artists. If not already in artist id array push them and then search artist by id if max degree has not been reached.
function searchRecommendations(artistId, degree) {
  var recommendationsPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists',
    data: {
      type: 'artist',
    }}));
    
    recommendationsPromise.then(function (response) {
      if (degree < 1) {
        $(response.artists).each(function () {
          if (ARTISTIDS.indexOf(this.id) == -1) {
            ARTISTIDS.push(this.id);
            if (this.images.length > 0) {
              ARTISTS.push({'name': this.name, 'artistId': this.id, 'imageURL': this.images[0].url});
            } else {
              ARTISTS.push({'name': this.name, 'artistId': this.id, 'imageURL': 'images/spotify.png'});  
            }
            searchArtistById(this.id, degree+1);
          }
        });
      } else if (degree == 1) {
        $(response.artists).each(function () {
          if (ARTISTIDS.indexOf(this.id) == -1) {
            ARTISTIDS.push(this.id);
            if (this.images.length > 0) {
              ARTISTS.push({'name': this.name, 'artistId': this.id, 'imageURL': this.images[0].url});
            } else {
              ARTISTS.push({'name': this.name, 'artistId': this.id, 'imageURL': 'images/spotify.png'});  
            }
          }
        });
      } else {
        return;
      }
    }); 
}

//Search for top tracks for artist by id and display for user
function getTracks(artistId) {
 var trackPromise = Promise.resolve($.ajax({
  url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks',
  data: {
    country: 'US'
  }}));
 trackPromise.then(function(response) {
    var tracksHTML = '<div class="trackHeader"><div class="number">#</div><div class="song">Song</div></div>';
    var i = 0;
    var index = ARTISTS.findIndex(x => x.artistId == artistId);
    ARTISTS[index].tracks = response.tracks;
    $('.artistImage').css({'background-image': 'url(' + ARTISTS[index].imageURL +')'});
    $('.artistName').html('<h2>' + ARTISTS[index].name +'</h2>');
    $(ARTISTS[index].tracks).each(function (){
      i++;
      tracksHTML = tracksHTML + '<div class="tracksList truncate" id="' + this.id + '" src="' + this.preview_url + '">' +
      '<div class="trackNumber">' + i +'</div><i class="fa fa-play play" aria-hidden="true"></i>' + '<div class="trackName">' + this.name + '</div></div>';
    });
    $('.tracks').html(tracksHTML);
    $('.artistInfo').removeClass('hidden');
  });
}

function printArtistName(ARTISTS) {
  for (var i = 0; i < ARTISTS.length; i++) {
    $('.results').append('<div class="name" attr="'+ ARTISTS[i].artistId +'">' + ARTISTS[i].name + '</div>');
  }

  $('.name').click(function(e) {
    AUDIOOBJ.pause();
    $('.name').removeClass('selected');
    $(this).addClass('selected');
    getTracks($(this).attr('attr'));
  });
}

$(document).ready(function() {
  $('form[name="artist-form"]').submit(function (e) {
    e.preventDefault();
    AUDIOOBJ.pause();
    ARTISTS = [];
    ARTISTIDS = [];
    $('.results').empty();
    $('.artistInfo').addClass('hidden');
    
    var index,
        degree = 0;
    
    searchArtistByName($(this).find('#artist-1-query').val(), degree);

    setTimeout (function () {
      console.log(ARTISTS);
      printArtistName(ARTISTS);
    }, 2000);
  });

  //Play or pause the track user clicks on
  $('.tracks').click(function(e) { 
    if(AUDIOOBJ){
      AUDIOOBJ.pause();
    }

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      $('.tracksList').on('click touch', function(e){
        $('iframe').remove(); //Remove all previous iframes. 

        var i = document.createElement('iframe');
        i.src =  $(this).attr('src');
        $(this).append(i);
        console.log(this);
      });
    } else {
      AUDIOOBJ.setAttribute('src', $(e.target).closest('.tracksList').attr('src'));
      if($('#' + $(e.target).closest('.tracksList').attr('id')).hasClass('playing')) {
        AUDIOOBJ.pause();
      } else {
        AUDIOOBJ.volume = 0.1;
        AUDIOOBJ.load();
        AUDIOOBJ.play();
      }
      $('.playing .fa').toggleClass('fa-play fa-pause');
      $('.tracksList').removeClass('playing');
      $('#' + $(e.target).closest('.tracksList').attr('id')).addClass('playing');
      $('.playing .fa').toggleClass('fa-play fa-pause');
    }
  });
})