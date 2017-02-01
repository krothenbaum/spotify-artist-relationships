// find template and compile it
var templateSource = document.getElementById('results-template').innerHTML,
		template = Handlebars.compile(templateSource),
		firstDegreeList = $('.firstDegree'),
		secondDegreeList = $('.secondDegree'),
		thirdDegreeList = $('.thirdDegree'),
		fourthDegreeList = $('.fourthDegree'),
		fifthDegreeList = $('.fifthDegree')
		sixthDegreeList = $('.sixthDegree')
		
		playingCssClass = 'playing',
		audioObject = null;
var state = {
	recommendationArray: [],
	currentDegree: 1,
	maxDegree: 3
}

function searchArtists(artist, element) {
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
			element.append(template(response));
		}
	});	
}

function setRecommendationArray(state, response) {
	state.recommendationArray.push(response);
}

function pushMatches(state, relationshipArray) {
	relationshipArray.length = 0;
	for(var i = 1; i < state.recommendationArray.length; i++) {
		for(var j = 0; j < state.recommendationArray[i].artists.length; j++) {
			for(var k = 0; k < state.recommendationArray[0].artists.length; k++) {
				if(state.recommendationArray[i].artists[j].id === state.recommendationArray[0].artists[k].id) {
					relationshipArray.push(state.recommendationArray[0].artists[k]);
				}
			}
		}
	}
	relationshipArray.sort(function (a, b) {
		return a.name.localeCompare(b.name);
	});
	return relationshipArray;
}

function renderMatches(state, relationshipArray) {
	var artistHTML = '';
	relationshipArray.forEach(function (artist) {
		artistHTML = (artistHTML + '<h5>' + artist.name + '</h5>');
		for(var i = 1; i < state.recommendationArray.length; i++) {
			for(var j = 0; j < state.recommendationArray[i].artists.length; j++)
			if (artist.name === state.recommendationArray[i].artists[j].name) {
				state.recommendationArray[i].artists.splice(i, 1);
			}
		}		
	});
	$('.matched-artists').append(artistHTML);
	console.log(state.recommendationArray);
}

function nextDegree(state) {
	if(state.currentDegree < state.maxDegree) {
		for(var i = 1; i < state.recommendationArray.length; i++) {
			nextArtistList = state.recommendationArray.splice(i, 1);
			for(var j = 0; j < nextArtistList[0].artists.length; j++) {
				if (state.currentDegree === 1) {
					searchArtists(nextArtistList[0].artists[j].name, thirdDegreeList);
				} else if (state.currentDegree === 2) {
					searchArtists(nextArtistList[0].artists[j].name, fourthDegreeList);
				}
			}
		}
	state.currentDegree++;
	}
}

function compareRecommendations(state) {
	var relationshipArray = [];

	relationshipArray = pushMatches(state, relationshipArray);
	//render matched artists and remove them from list
	renderMatches(state, relationshipArray);	
	//call recommendations on all artists in recommendation list
	// nextDegree(state);	
}

$(document).ready(function () {
	$('form[name="artist-form"]').submit(function (e) {
		e.preventDefault();
		var firstArtist = $(this).find('#artist-1-query').val();
		var finalArtist = $(this).find('#artist-2-query').val();
		firstDegreeList.html(firstArtist);
		sixthDegreeList.html(finalArtist);
		searchArtists(finalArtist, fifthDegreeList);
		searchArtists(firstArtist, secondDegreeList);
		compareRecommendations(state);
		$('#get-recs').removeClass('hidden');
	});
	$('#get-recs').click(function(e) {
		e.preventDefault;
		compareRecommendations(state);
		$('#get-next-degree').removeClass('hidden');
	})
	$('#get-next-degree').click(function(e) {
		nextDegree(state);
	})
})

//get artist 1 and 2 from user
//search for artist 1 and 2 on spotify
//get the list of recommended artists for artist 1 and 2
//for each artist in artist1.recommenations compare to to each artist in artist2.recommendations
//if artist in artist1.recommendations equals an artist in artist2.recommendations disply the relationship tree.
//else get the recommendations for the first artist in artist1.recommendations and compare.
//continue until match is found or number of jumps is reached.