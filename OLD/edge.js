// var DEGREES = 2; //Maximum levels queried; starts at zero
// var FIRSTIDS = [];
// var SECONDIDS = [];
// var ARTISTS = [];
// var AUDIOOBJ = new Audio();
// var FIRSTMUSICIANS = {};
// var SECONDMUSICIANS = {};

// $(function(){
//   $('form[name="artist-form"]').submit(function (e) {
//     e.preventDefault();
//     searchArtist($(this).find('#artist-1-query').val(), 0, 1);
//     // searchArtist($(this).find('#artist-2-query').val(), 0, 2);

//     setTimeout (function () {
//       // renderTree();
//       // renderSecondTree();
//       // renderMatches();
//     }, 2000);
//   });
// })

// //search for the artist the user inputs
// function searchArtist(artist, degree, artistCount) {
//   var artistPromise = Promise.resolve($.ajax({
//     url: 'https://api.spotify.com/v1/search',
//     data: {
//       q: artist,
//       type: 'artist'
//     }}));
//     artistPromise.then(function (response) {      
//       ARTISTS.push(response.artists.items[0]);
//       if (artistCount == 1) {
//         FIRSTIDS.push(response.artists.items[0].id);
//         FIRSTMUSICIANS.push('name': response.artists.items[0].name, 'recommendations': [], 'imageURL': response.artists.items[0].images[0].url, 'artistId': response.artists.items[0].id);
//         // FIRSTMUSICIANS.name = response.artists.items[0].name;
//         // FIRSTMUSICIANS.children = [];
//         // FIRSTMUSICIANS.imageURL = response.artists.items[0].images[0].url;
//         // FIRSTMUSICIANS.artistId = response.artists.items[0].id;
//       } else {
//         SECONDIDS.push(response.artists.items[0].id);
//         SECONDMUSICIANS.name = response.artists.items[0].name;
//         SECONDMUSICIANS.children = [];
//         SECONDMUSICIANS.imageURL = response.artists.items[0].images[0].url;
//         SECONDMUSICIANS.artistId = response.artists.items[0].id;
//       }
//       var index = 0;
//       searchRecommendations(response.artists.items[0].id, degree, artistCount, index);
//     }
//   });
// }

// function searchRecommendations(artist, degree, artistCount, index) {
//   if( degree == DEGREES ){
//     return; 
//   } else {
//     var recPromise = Promise.resolve($.ajax({
//       url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
//       data: {
//         type: 'artist'
//       }}));
//     recPromise.then(function(response) {

//     $(response.artists).each(function(){            
//       if (artistCount == 1 && FIRSTIDS.indexOf(this.id) == -1) {
//         if (degree == 0) {
//           FIRSTMUSICIANS.recommendations.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
//           FIRSTIDS.push(this.id);
//           ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
//           index = FIRSTMUSICIANS.children.findIndex(x => x.name == this.name);
//           searchArtist(this.name, degree+1, 1)
//           // searchRecommendations(this.id, degree+1, artistCount, index);
//         } else {
//           // FIRSTMUSICIANS.children[index].children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
//           FIRSTMUSICIANS.children[index].children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
//           FIRSTIDS.push(this.id);
//           ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
//           searchRecommendations(this.id, degree+1, artistCount, index);
//         }
//       } else if (SECONDIDS.indexOf(this.id) == -1 && artistCount == 2) {
//         if (degree == 0) {
//           SECONDMUSICIANS.children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
//           SECONDIDS.push(this.id);
//           ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
//           index = SECONDMUSICIANS.children.findIndex(x => x.name == this.name);
//           searchRecommendations(this.id, degree+1, artistCount, index)
//         } else {
//           SECONDMUSICIANS.children[index].children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
//           SECONDIDS.push(this.id);
//           ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
//           searchRecommendations(this.id, degree+1, artistCount, index);             
//         }
//       }
//   });
// });
// }
// }

// function getTracks(artistId) {
//   if(AUDIOOBJ){
//     AUDIOOBJ.pause();
//   }

//   var trackPromise = Promise.resolve($.ajax({
//       url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks',
//       data: {
//         country: 'US'
//       }}));
//   trackPromise.then(function(response) {      
//     AUDIOOBJ.setAttribute('src', response.tracks[0].preview_url);
//     AUDIOOBJ.volume = 0.1;
//     AUDIOOBJ.load();
//     AUDIOOBJ.play();
//   });
// }

// function renderCircle() {
var diameter = 960,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null);
    // .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

d3.json("readme-flare-imports.json", function(error, classes) {
  console.log(Date.now());
  if (error) throw error;

  // console.log(classes);

  var nodes = cluster.nodes(packageHierarchy(classes)),
      links = packageImports(nodes);
      console.log(links);

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
      .on("mouseout", mouseouted);
});

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
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }
  // console.log(classes);
  classes.forEach(function(d) {
    find(d.name, d);
  });
  // console.log(map[""]);
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
      console.log(map);
      console.log(i);
      imports.push({source: map[d.name], target: map[i]});
    });
  });
  // console.log(imports)
  return imports;
}
// }