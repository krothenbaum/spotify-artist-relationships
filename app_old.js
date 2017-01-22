// find template and compile it
var templateSource = document.getElementById('results-template').innerHTML,
		template = Handlebars.compile(templateSource),
		firstArtistList = $('.artist-1-recs'),
		secondArtistList = $('.artist-2-recs'),
		recommendationArray = [],
		playingCssClass = 'playing',
		audioObject = null;

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
			setRecommendationArray(response);
			element.html(template(response));
		}
	});	
}

function setRecommendationArray(state, response) {
	recommendationArray.push(response);
}

function compareRecommendations(recArr) {
	var relationshipArray = [];
	var firstList = recArr[0];
	var secondList = recArr[0];
	var artistHTML = '';
	// find matches
	for (var i = 0; i < firstList.artists.length; i++) {
		for (var j = 0; j < secondList.artists.length; j++) {
			if (firstList.artists[i].id === secondList.artists[j].id) {
				relationshipArray.push(secondList.artists[j].name);
			}
		}
	}
	//render matched artists and remove them from list
	relationshipArray.forEach(function (artist) {
		artistHTML = (artistHTML + '<h5>' + artist + '</h5>');
		for(var i = 0; i < firstList.artists.length; i++) {
			if (artist === firstList.artists[i].name) {
				firstList.artists.splice(i, 1);
			}
		}		
	});

	//call recommendations on all artists in recommendation list
	
	$('.matched-artists').html(artistHTML);
}

$(document).ready(function () {
	$('form[name="artist-form"]').submit(function (e) {
		e.preventDefault();
		searchArtists($(this).find('#artist-2-query').val(), secondArtistList);
		searchArtists($(this).find('#artist-1-query').val(), firstArtistList);

		$('#get-recs').removeClass('hidden');
	});
	$('#get-recs').click(function(e) {
		e.preventDefault;
		compareRecommendations(recommendationArray);
	})
})

//get artist 1 and 2 from user
//search for artist 1 and 2 on spotify
//get the list of recommended artists for artist 1 and 2
//for each artist in artist1.recommenations compare to to each artist in artist2.recommendations
//if artist in artist1.recommendations equals an artist in artist2.recommendations disply the relationship tree.
//else get the recommendations for the first artist in artist1.recommendations and compare.
//continue until match is found or number of jumps is reached.