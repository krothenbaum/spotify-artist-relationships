var DEGREES = 2; //Maximum levels queried; starts at zero
var FIRSTIDS = [];
var SECONDIDS = [];
var ARTISTS = [];
var AUDIOOBJ = new Audio();
var FIRSTMUSICIANS = {};
var SECONDMUSICIANS = {};

$(function(){
	$('form[name="artist-form"]').submit(function (e) {
		e.preventDefault();
		searchArtist($(this).find('#artist-1-query').val(), 0, 1);
		searchArtist($(this).find('#artist-2-query').val(), 0, 2);

		setTimeout (function () {
			renderTree();
			renderSecondTree();
			renderMatches();
		}, 2000);
	});
})

//search for the artist the user inputs
function searchArtist(artist, degree, artistCount) {
	$.ajax({
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: artist,
			type: 'artist'
		},
		success: function (response) {			
			ARTISTS.push(response.artists.items[0]);
			if (artistCount == 1) {
				FIRSTIDS.push(response.artists.items[0].id);
				FIRSTMUSICIANS.name = response.artists.items[0].name;
				FIRSTMUSICIANS.children = [];
				FIRSTMUSICIANS.imageURL = response.artists.items[0].images[0].url;
				FIRSTMUSICIANS.artistId = response.artists.items[0].id;
			} else {
				SECONDIDS.push(response.artists.items[0].id);
				SECONDMUSICIANS.name = response.artists.items[0].name;
				SECONDMUSICIANS.children = [];
				SECONDMUSICIANS.imageURL = response.artists.items[0].images[0].url;
				SECONDMUSICIANS.artistId = response.artists.items[0].id;
			}
			var index = 0;
			searchRecommendations(response.artists.items[0].id, degree, artistCount, index);
		}
	});
}

function searchRecommendations(artist, degree, artistCount, index) {
	if( degree == DEGREES ){
		return; 
	} else {
		var artistPromise =	Promise.resolve($.ajax({
			url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
			data: {
				type: 'artist'
			}}));
		artistPromise.then(function(response) {

		$(response.artists).each(function(){						
			if (artistCount == 1 && FIRSTIDS.indexOf(this.id) == -1) {
				if (degree == 0) {
					FIRSTMUSICIANS.children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
					FIRSTIDS.push(this.id);
					ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
					index = FIRSTMUSICIANS.children.findIndex(x => x.name == this.name);
					searchRecommendations(this.id, degree+1, artistCount, index);
				} else {
					FIRSTMUSICIANS.children[index].children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
					FIRSTIDS.push(this.id);
					ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
					searchRecommendations(this.id, degree+1, artistCount, index);
				}
			} else if (SECONDIDS.indexOf(this.id) == -1 && artistCount == 2) {
				if (degree == 0) {
					SECONDMUSICIANS.children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
					SECONDIDS.push(this.id);
					ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
					index = SECONDMUSICIANS.children.findIndex(x => x.name == this.name);
					searchRecommendations(this.id, degree+1, artistCount, index)
				} else {
					SECONDMUSICIANS.children[index].children.push({'name': this.name, 'imageURL': this.images[0].url, 'artistId': this.id , 'children': []});
					SECONDIDS.push(this.id);
					ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
					searchRecommendations(this.id, degree+1, artistCount, index);							
				}
			}
	});
});
}
}

function getTracks(artistId) {
	if(AUDIOOBJ){
		AUDIOOBJ.pause();
	}

	var trackPromise = Promise.resolve($.ajax({
			url: 'https://api.spotify.com/v1/artists/' + artistId + '/top-tracks',
			data: {
				country: 'US'
			}}));
	trackPromise.then(function(response) {			
		AUDIOOBJ.setAttribute('src', response.tracks[0].preview_url);
		AUDIOOBJ.volume = 0.1;
		AUDIOOBJ.load();
		AUDIOOBJ.play();
	});
}

function renderMatches() {
	ARTISTS.sort(function(a, b) {
		return a.name.localeCompare(b.name);
	});
	ARTISTS.forEach(function(artist){
		if (FIRSTIDS.indexOf(artist.id) > -1 && SECONDIDS.indexOf(artist.id) > -1) {
			FIRSTIDS.splice(FIRSTIDS.indexOf(artist.id), 1);
			SECONDIDS.splice(SECONDIDS.indexOf(artist.id), 1);
			var matchesHTML = '<h5>' + artist.name + '<h5>';
			$('.matches').append(matchesHTML);
		}
	});
	$('.matches').removeClass('hidden');
}

function renderTree() {
	var margin = {top: 120, right: 20, bottom: 20, left: 140},
	width = ($(window).width() / 3) - margin.right - margin.left,
	height = 800;

	var i = 0,
	duration = 750,
	root;

	var tree = d3.layout.tree()
	.size([width, height]);

	var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select(".first-tree").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + (height / 4) + ")");


  root = FIRSTMUSICIANS;
  root.x0 = height / 2;
  root.y0 = height;

  function collapse(d) {
  	if (d.children) {
  		d._children = d.children;
  		d._children.forEach(collapse);
  		d.children = null;
  	}
  }
  root.children.forEach(collapse);
  update(root);

d3.select(self.frameElement).style("height", "800px");

function update(source) {
		
		var clipPathId = 0;
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
  .data(nodes, function(d) { return d.id || (d.id = ++i); });
  

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
  .attr("class", "node")
  .attr("id", function(d) { return d.artistId; })
  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
  .on("click", click);

  nodeEnter.append("circle")
  .attr("r", 32)
  .style("fill", function(d) { return d._children ? "#C8C8C8" : "#fff"; });

  clipPathId++;

  nodeEnter.append("clipPath")
  .attr("id", "clipCircle" + clipPathId)
  .append("circle")
  .attr("r", 32);

  nodeEnter.append("image")
  .attr("xlink:href", function(d) { return d.imageURL; })
  .attr("x", "-32px")
  .attr("y", "-32px")
  .attr("clip-path", "url(#clipCircle" + clipPathId + ")")
  .attr("width", "64px")
  .attr("height", "64px");

  nodeEnter.append("text")
  .attr("x", function(d) { return d.children || d._children ? -50 : 50; })
  .attr("dy", ".35em")
  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  .text(function(d) { return d.name; })
  .style("fill", "white");
  // .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
  .attr("r", 32)
  .style("fill", function(d) { return d._children ? "#C8C8C8" : "#fff"; });

  nodeUpdate.select("image")
  .attr("xlink:href", function(d) { return d.imageURL; })
  .attr("width", "64px")
  .attr("height", "64px");

  nodeUpdate.select("text")
  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  .remove();

  nodeExit.select("circle")
  .attr("r", 32);

  nodeExit.select("image")
  .attr("xlink:href", function(d) { return d.imageURL; })
  .attr("width", "64px")
  .attr("height", "64px");

  nodeExit.select("text")
  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
  .attr("class", "link")
  .attr("d", function(d) {
  	var o = {x: source.x0, y: source.y0};
  	return diagonal({source: o, target: o});
  });

  // Transition links to their new position.
  link.transition()
  .duration(duration)
  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
  .duration(duration)
  .attr("d", function(d) {
  	var o = {x: source.x0, y: source.y0};
  	return diagonal({source: o, target: o});
  })
  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
  	d.x0 = d.x;
  	d.y0 = d.y;
  });
 }

// Toggle children on click.
function click(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}

	getTracks(d.artistId);
	update(d);
}
}

function renderSecondTree() {
	var margin = {top: 120, right: 140	, bottom: 20, left: 20},
	width = ($(window).width() / 3) - margin.right - margin.left,
	height = 800;

	var i = 0,
	duration = 750,
	root;

	var tree = d3.layout.tree()
	.size([width, height]);

	var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select(".second-tree").append("svg")
	.attr("class", "float-right")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + (height / 4) + ")");

  // if (error) throw error;
  root = SECONDMUSICIANS;
  root.x0 = height / 2;
  root.y0 = width;

  function collapse(d) {
  	if (d.children) {
  		d._children = d.children;
  		d._children.forEach(collapse);
  		d.children = null;
  	}
  }
  root.children.forEach(collapse);
  update(root);
//});

// d3.select(self.frameElement).style("height", "800px");

function update(source) {
		
		var clipPathId = 0;
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = width - (d.depth * 180); });

  // Update the nodes…
  var node = svg.selectAll("g.node")
  .data(nodes, function(d) { return d.id || (d.id = ++i); });
  

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
  .attr("class", "node")
  .attr("id", function(d) { return d.artistId; })
  .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
  .on("click", click);

  nodeEnter.append("circle")
  .attr("r", 32)
  .style("fill", function(d) { return d._children ? "#C8C8C8" : "#fff"; });

  clipPathId++;

  nodeEnter.append("clipPath")
  .attr("id", "clipCircle" + clipPathId)
  .append("circle")
  .attr("r", 32);

  nodeEnter.append("image")
  .attr("xlink:href", function(d) { return d.imageURL; })
  .attr("x", "-32px")
  .attr("y", "-32px")
  .attr("clip-path", "url(#clipCircle" + clipPathId + ")")
  .attr("width", "64px")
  .attr("height", "64px");

  nodeEnter.append("text")
  .attr("x", function(d) { return d.children || d._children ? 125 : 150; })
  .attr("dy", ".35em")
  .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
  .text(function(d) { return d.name; })
  .style("fill", "white");
  // .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
  .attr("r", 32)
  .style("fill", function(d) { return d._children ? "#C8C8C8" : "#fff"; });

  nodeUpdate.select("image")
  .attr("xlink:href", function(d) { return d.imageURL; })
  .attr("width", "64px")
  .attr("height", "64px");

  nodeUpdate.select("text")
  .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
  .duration(duration)
  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
  .remove();

  nodeExit.select("circle")
  .attr("r", 32);

  nodeExit.select("image")
  .attr("xlink:href", function(d) { return d.imageURL; })
  .attr("width", "64px")
  .attr("height", "64px");

  nodeExit.select("text")
  .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
  .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
  .attr("class", "link")
  .attr("d", function(d) {
  	var o = {x: source.x0, y: source.y0};
  	return diagonal({source: o, target: o});
  });

  // Transition links to their new position.
  link.transition()
  .duration(duration)
  .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
  .duration(duration)
  .attr("d", function(d) {
  	var o = {x: source.x, y: source.y};
  	return diagonal({source: o, target: o});
  })
  .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
  	d.x0 = d.x;
  	d.y0 = d.y;
  });
 }

// Toggle children on click.
function click(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
	getTracks(d.artistId);
	update(d);
}
}
