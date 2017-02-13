var DEGREES = 2; //Maximum levels queried; starts at zero
var FIRSTIDS = [];
var SECONDIDS = [];
var ARTISTS = [];
var AUDIOOBJ = new Audio();
var FIRSTMUSICIANS = [];
var SECONDMUSICIANS = {};

$(function() {
	var index = 0;
	var key = 'artists';
	searchArtist('the beatles', 0, 1, index, key);
	setTimeout (function () {
  renderCircle();
 }, 2000);
})

function searchArtist(artist, degree, artistCount, index, key) {
	var artistPromise = Promise.resolve($.ajax({
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: artist,
			type: 'artist'
		}}));
	artistPromise.then(function (response) {      
		if (artistCount == 1 && FIRSTIDS.indexOf(response.artists.items[0].id) == -1) {
			FIRSTIDS.push(response.artists.items[0].id);
			key = key + '.' + response.artists.items[0].id;
			FIRSTMUSICIANS.push({'key': key, 'name': response.artists.items[0].name, 'imports': []});

		}
		index = FIRSTMUSICIANS.findIndex(x => x.name == response.artists.items[0].name);
		searchRecommendations(response.artists.items[0].id, degree, artistCount, index, key);
	});
}

function searchRecommendations(artist, degree, artistCount, index, key) {
	if( degree == DEGREES ){
		return; 
	} else {
		var recPromise = Promise.resolve($.ajax({
			url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
			data: {
				type: 'artist'
			}}));
		recPromise.then(function(response) {
			$(response.artists).each(function(){
				if (artistCount == 1 && FIRSTIDS.indexOf(this.id) == -1) {
					// key = key + '.' + this.id;
					FIRSTMUSICIANS[index].imports.push({'key': key + '.' + this.id, 'name': this.name, 'imports': []});
					if (degree+1 < DEGREES) {
						searchArtist(this.name, degree+1, 1, index, key);
					}
					else {
						FIRSTMUSICIANS.push({'key': key + '.' + this.id, 'name': this.name, 'imports': []});
						return;
					}
				}
			});
		});
	}
}

function renderCircle() {
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
    	if (error) throw error;

    	var nodes = cluster.nodes(packageHierarchy(FIRSTMUSICIANS)),
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
	console.log(classes);
	var map = {};

	function find(key, data) {
		var node = map[key], i;
		if (!node) {
			node = map[key] = data || {key: key, children: []};
			if (key.length) {
				// console.log(find(key.substring(0, i = key.lastIndexOf("."))));
				node.parent = find(key.substring(0, i = key.lastIndexOf(".")));
				node.parent.children.push(node);
				node.key = key.substring(i + 1);
			}
		}
		return node;
	}

	classes.forEach(function(d) {
		find(d.key, d);	
	});
	console.log(map[""]);
	return map[""];
}
// function packageHierarchy(classes) {
// 	var map = {};

// 	function find(name, data) {
// 		var node = map[name], i;
// 		if (!node) {
// 			node = map[name] = data || {name: name, children: []};
// 			if (name.length) {
// 				node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
// 				node.parent.children.push(node);
// 				node.key = name.substring(i + 1);
// 			}
// 		}
// 		return node;
// 	}

// 	classes.forEach(function(d) {
// 		find(d.name, d);
// 	});
// 	// console.log(map);
// 	return map[""];
// }

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
	var map = {},
	recommendations = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
  	map[d.key] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
  	if (d.recommendations) d.recommendations.forEach(function(i) {
  		recommendations.push({source: map[d.key], target: map[i]});
  	});
  });
  // console.log(imports);
  return recommendations;
 }
}