// find template and compile it
var templateSource = document.getElementById('results-template').innerHTML,
		template = Handlebars.compile(templateSource),
		firstArtistList = $('.artist-1-recs'),
		secondArtistList = $('.artist-2-recs'),
		finalArtistList = $('.artist-final-recs')
		
		playingCssClass = 'playing',
		audioObject = null;
var state = {
	recommendationArray: [],
	currentDegree: 1,
	maxDegree: 2
}

function searchArtists(artist, element) {
	alert('Artist');
	$.ajax({
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: artist,
			type: 'artist'
		},
			success: function (response) {
				searchRecommendations(response, element);
		}
	});
}

function searchRecommendations(artist, element) {
	alert('recommendations');
	$.ajax({
		url: 'https://api.spotify.com/v1/artists/' + artist.artists.items[0].id + '/related-artists',
		data: {
			type: 'artist',
		},
		success: function (response) {
			response.artists.sort(function(a, b) {
   			return a.name.localeCompare(b.name);
			});
			setRecommendationArray(state, response);
			element.html(template(response));
		}
	});	
}

function setRecommendationArray(state, response) {
	alert('Set Array');
	state.recommendationArray.push(response);
}

function compareRecommendations(state) {
alert('Compare');
	var relationshipArray = [];
	var artistHTML = '';

	// find matches
// 	for (var k = 1; k < state.recommendationArray.length - 1; k++) {
// 		for (var i = 0; i < state.recommendationArray[k].artists.length; i++) {
// 			for (var j = 0; j < state.recommendationArray[i].artists.length; j++) {
// 				if (state.recommendationArray[k].artists[i].id === state.recommendationArray[0].artists[j].id) {
// 					relationshipArray.push(state.recommendationArray.artists[j]);
// 				}
// 		}
// 	}
// }

for(var i = 1; i < state.recommendationArray.length; i++) {
	for(var j = 0; j < state.recommendationArray[i].artists.length; j++) {
		for(var k = 0; k < state.recommendationArray[0].artists.length; k++) {
			if(state.recommendationArray[i].artists[j].id === state.recommendationArray[0].artists[k].id) {
				relationshipArray.push(state.recommendationArray[0].artists[k]);
			}
		}
	}
}
console.log(relationshipArray);
	//render matched artists and remove them from list
	relationshipArray.forEach(function (artist) {
		artistHTML = (artistHTML + '<h5>' + artist.name + '</h5>');
		for(var i = 1; i < state.recommendationArray.length; i++) {
			for(var j = 0; j < state.recommendationArray[i].artists.length; j++)
			if (artist.name === state.recommendationArray[i].artists[j].name) {
				state.recommendationArray[i].artists.splice(i, 1);
			}
		}		
	});
	$('.matched-artists').html(artistHTML);
	//call recommendations on all artists in recommendation list
	
if(state.currentDegree < state.maxDegree) {
	for(var i = 1; i < state.recommendationArray.length - 1; i++) {
		console.log(state.recommendationArray[i]);
		for(var j = 0; j < state.recommendationArray[i].length; j++) {

			searchArtists(state.recommendationArray[i].artists[j].name, secondArtistList);
			state.recommendationArray.splice(i, 1);
			state.currentDegree++;
			console.log(recommendationArray);
		}
	}
}
}

$(document).ready(function () {
	$('form[name="artist-form"]').submit(function (e) {
		e.preventDefault();
		searchArtists($(this).find('#artist-2-query').val(), finalArtistList);
		searchArtists($(this).find('#artist-1-query').val(), firstArtistList);
		compareRecommendations(state);
		$('#get-recs').removeClass('hidden');
	});
	// $('#get-recs').click(function(e) {
	// 	e.preventDefault;
	// 	compareRecommendations(state);
	// })
})

//get artist 1 and 2 from user
//search for artist 1 and 2 on spotify
//get the list of recommended artists for artist 1 and 2
//for each artist in artist1.recommenations compare to to each artist in artist2.recommendations
//if artist in artist1.recommendations equals an artist in artist2.recommendations disply the relationship tree.
//else get the recommendations for the first artist in artist1.recommendations and compare.
//continue until match is found or number of jumps is reached.