var ARTISTS = [];
var ARTISTIDS = [];
var AUDIOOBJ = new Audio();

function searchArtistByName(artistName, index, degree) {
  var artistPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/search',
    data: {
      q: artistName,
      type: 'artist'
    }}));    
    artistPromise.then(function (response) {
      ARTISTIDS.push(response.artists.items[0].id);
      if (response.artists.items[0].images.length > 0) {
        ARTISTS.push({'name': response.artists.items[0].name, 'imports': [], 'artistId': response.artists.items[0].id, 'imageURL': response.artists.items[0].images[0].url});
      } else {
        ARTISTS.push({'name': response.artists.items[0].name, 'imports': [], 'artistId': response.artists.items[0].id, 'imageURL': 'images/spotify.png'});
      }
      index = ARTISTS.findIndex(x => x.name == response.artists.items[0].name);
      searchRecommendations(response.artists.items[0].id, index, degree);
    }, function (error) {
        console.error('uh oh: ', error);   // 'uh oh: something bad happened’
    });
}

function searchArtistById(artistId, index, degree) {
  var artistIdPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/artists/' + artistId,
    }));    
    artistIdPromise.then(function (response) {
      ARTISTIDS.push(response.id);
      if (response.images.length > 0) {
        ARTISTS.push({'name': response.name, 'imports': [], 'artistId': response.id, 'imageURL': response.images[0].url});
      } else {
        ARTISTS.push({'name': response.name, 'imports': [], 'artistId': response.id, 'imageURL': 'images/spotify.png'});
      }
      index = ARTISTS.findIndex(x => x.name == response.name);
      searchRecommendations(response.id, index, degree);
    }, function (error) {
        console.error('uh oh: ', error);   // 'uh oh: something bad happened’
    });
}

function searchRecommendations(artistId, index, degree) {
  var recommendationsPromise = Promise.resolve($.ajax({
    url: 'https://api.spotify.com/v1/artists/' + artistId + '/related-artists',
    data: {
      type: 'artist',
    }}));
    
    recommendationsPromise.then(function (response) {
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
          console.log(this);
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
    }); 
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

function getTracks(artistId, index) {
    var trackPromise = Promise.resolve($.ajax({
        url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks',
        data: {
          country: 'US'
        }}));
    trackPromise.then(function(response) {
      var tracksHTML = '<div class="trackHeader"><div class="number">#</div><div class="song">Song</div></div>';
      var i = 0;
      ARTISTS[index].tracks = response.tracks;
       $('.artistImage').css({'background-image': 'url(' + ARTISTS[index].imageURL +')'});
      $('.artistName').html('<h2>' + ARTISTS[index].name +'</h2>');
      $(ARTISTS[index].tracks).each(function (){
        i++;
        tracksHTML = tracksHTML + '<div class="tracksList truncate" id="' + this.id + '">' +
        '<div class="trackNumber">' + i + '</div><div class="trackName">' + this.name + '</div></div>';
      });
      $('.tracks').html(tracksHTML);
      $('.artistInfo').removeClass('hidden');
      playPreview(ARTISTS[index].artistId, index);
    });
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
  AUDIOOBJ.play();
}
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
    
    searchArtistByName($(this).find('#artist-1-query').val(), index, degree);
    var artist2 = $(this).find('#artist-2-query').val();
    setTimeout (function () {
      searchArtistByName(artist2, index, degree);
    }, 1000);

    setTimeout (function () {
      renderCircle();
    }, 2000);
  });
})