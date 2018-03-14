var ARTISTS = [];
var ARTISTIDS = [];
var AUDIOOBJ = new Audio();
var TOKEN;

async function searchArtistByName(artistName, index, degree) {
  try {
    var response = await ($.ajax({
      url: 'https://api.spotify.com/v1/search',
      headers: {
        'Authorization': 'Bearer ' + TOKEN
      },
      data: {
        q: artistName,
        type: 'artist'
      }
    }));

    ARTISTIDS.push(response.artists.items[0].id);

    if (response.artists.items[0].images.length > 0) {
      ARTISTS.push({'name': response.artists.items[0].name, 'imports': [], 'artistId': response.artists.items[0].id, 'imageURL': response.artists.items[0].images[0].url});
    } else {
      ARTISTS.push({'name': response.artists.items[0].name, 'imports': [], 'artistId': response.artists.items[0].id, 'imageURL': 'images/spotify.png'});
    }

    index = ARTISTS.findIndex(x => x.name == response.artists.items[0].name);
    await searchRecommendations(response.artists.items[0].id, index, degree);

  } catch (e) {
    console.log("ERROR: " + JSON.stringify(e));
  }
}

async function searchArtistById(artistId, index, degree) {
  try {
    var response = await ($.ajax({
      url: 'https://api.spotify.com/v1/artists/' + artistId,
      headers: {
        'Authorization': 'Bearer ' + TOKEN
      },
    }));
    ARTISTIDS.push(response.id);
    if (response.images.length > 0) {
      ARTISTS.push({'name': response.name, 'imports': [], 'artistId': response.id, 'imageURL': response.images[0].url});
    } else {
      ARTISTS.push({'name': response.name, 'imports': [], 'artistId': response.id, 'imageURL': 'images/spotify.png'});
    }
    index = ARTISTS.findIndex(x => x.name == response.name);
    await searchRecommendations(response.id, index, degree);
  } catch (e) {
    console.log('ERROR ' + JSON.stringify(e));
  }
}

async function searchRecommendations(artistId, index, degree) {
  try {
    var response = await ($.ajax({
      url: 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists',
      headers: {
        'Authorization': 'Bearer ' + TOKEN
      },
      data: {
        type: 'artist',
      }
    }));

    if (degree < 1  && ARTISTIDS.indexOf(this.id) == -1) {
      $(response.artists).each(function () {
        ARTISTIDS.push(this.id);
        ARTISTS[index].imports.push(this.name);
        if (this.images.length > 0) {
          ARTISTS.push({'name': this.name, 'imports': [], 'artistId': this.id, 'imageURL': this.images[0].url});
        } else {
          ARTISTS.push({'name': this.name, 'imports': [], 'artistId': this.id, 'imageURL': 'images/spotify.png'});
        }
        searchArtistById(this.id, index, degree+1);
      });
    } else if (degree == 1 && ARTISTIDS.indexOf(this.id) == -1) {
      $(response.artists).each(function () {
        ARTISTIDS.push(this.id);
        ARTISTS[index].imports.push(this.name);
        if (this.images.length > 0) {
          ARTISTS.push({'name': this.name, 'imports': [], 'artistId': this.id, 'imageURL': this.images[0].url});
        } else {
          ARTISTS.push({'name': this.name, 'imports': [], 'artistId': this.id, 'imageURL': 'images/spotify.png'});
        }
        index = ARTISTS.findIndex(x => x.artistId == this.id);
      });
    } else {
      return;
    }
  } catch (e) {
    console.log('ERROR ' + JSON.stringify(e));
  }
}

function renderCircle() {
var diameter = $(window).height(),
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null);

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });


var svg = d3.select('.results')
      .append("svg")
      .attr("width", '100%')
      .attr("height", '100%')
      .attr('viewBox','0 0 '+ diameter +' '+ diameter )
      .attr('preserveAspectRatio','xMinYMin')
      .append("g")
      .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

  var nodes = cluster.nodes(packageHierarchy(ARTISTS)),
      links = packageImports(nodes);

  link = link
      .data(bundle(links))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "link")
      .attr("d", line);

  node = node
      .data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("text")
      .attr("class", "node")
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.key; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted)
      .on("click", click);

function mouseovered(d) {
  node
      .each(function(n) { n.target = n.source = false; });

  link
      .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
    .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });

  node
      .classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
  link
      .classed("link--target", false)
      .classed("link--source", false);

  node
      .classed("node--target", false)
      .classed("node--source", false);
}

d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf("|")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });
  return imports;
}

function click(d) {
  var index = ARTISTS.findIndex(x => x.artistId == d.artistId);
  getTracks(d.artistId, index);
}

async function getTracks(artistId, index) {
  try {
    var response = await ($.ajax({
        url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks',
        headers: {
          'Authorization': 'Bearer ' + TOKEN
        },
        data: {
          country: 'US'
      }
    }));
    var tracksHTML = '<div class="trackHeader"><div class="number">#</div><div class="song">Song</div></div>';
    var i = 0;
    ARTISTS[index].tracks = response.tracks;
     $('.artistImage').css({'background-image': 'url(' + ARTISTS[index].imageURL +')'});
    $('.artistName').html('<h2>' + ARTISTS[index].name +'</h2>');
    $(ARTISTS[index].tracks).each(function (){
      i++;
      tracksHTML = tracksHTML + '<div class="tracksList truncate" id="' + this.id + '" src="' + this.preview_url + '">' +
      '<div class="trackNumber">' + i +'</div><i class="fa fa-play" aria-hidden="true"></i>' + '<div class="trackName">' + this.name + '</div></div>';
    });
    $('.tracks').html(tracksHTML);
    $('.artistInfo').removeClass('hidden');
  } catch (e) {
    console.log('ERROR ' + JSON.stringify(e));
  }
}

  function playPreview(artistId, index) {
    if(AUDIOOBJ){
      AUDIOOBJ.pause();
    }

    var trackNumber = Math.floor(Math.random() * ARTISTS[index].tracks.length);
    AUDIOOBJ.setAttribute('src', ARTISTS[index].tracks[trackNumber].preview_url);
    $('#' + ARTISTS[index].tracks[trackNumber].id).addClass('playing');
    AUDIOOBJ.volume = 0.1;
    AUDIOOBJ.load();
  }
}

async function authorizeSpotify() {
  let tokenPromise;
  try {
    tokenPromise = await $.ajax({
      type: 'GET',
      url: 'https://spotify-authentication-server.herokuapp.com/auth',
      crossDomain: true
    });
    return tokenPromise.token;
  } catch(e) {
    console.log('ERROR: ' + JSON.stringify(e));
  }
}

$(document).ready(function() {
  authorizeSpotify().then(value => {
    TOKEN = value;
  });

  $('form[name="artist-form"]').submit(function (e) {
    e.preventDefault();
    AUDIOOBJ.pause();
    ARTISTS = [];
    ARTISTIDS = [];
    $('.results').empty();
    $('.artistInfo').addClass('hidden');

    var index,
        degree = 0;

    searchArtistByName($(this).find('#artist-1-query').val(), index, degree);
    searchArtistByName($(this).find('#artist-2-query').val(), index, degree);
    setTimeout (function () {
      renderCircle();
      $('.description').removeClass('hidden');
      $('.collapse').removeClass('in');
    }, 2500);
  });

  $('.tracks').click(function(e) {
    if(AUDIOOBJ){
      AUDIOOBJ.pause();
    }
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
  })
})
