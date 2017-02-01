var DEGREES = 2; //Maximum levels queried; starts at zero
var FIRSTIDS = [];
var SECONDIDS = [];
var ARTISTS = [];
$(function(){
	$('form[name="artist-form"]').submit(function (e) {
		e.preventDefault();
		addNewArtist($(this).find('#artist-1-query').val(), 0, 1);
		addNewArtist($(this).find('#artist-2-query').val(), 0, 2);

		setTimeout (function () {
			renderMatches();
		}, 2000);
	});
})


//first degree find the single artist. Following degree search recommendations for each artist in that degree's Array index
function addNewArtist(artist, degree, artistCount){
	if (degree === 0) {
		searchArtist(artist, degree, artistCount);
	} else {
		ARTISTS[degree].artists.forEach(function(item) {
			searchRecommendations(item.id, degree);
		});
	}
}

//search for the artist the user inputs
function searchArtist(artist, degree, artistCount) {
	$.ajax({
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: artist,
			type: 'artist'
		},
		success: function (response) {
			console.log(response);
			
			ARTISTS.push(response.artists.items[0]);
			if (artistCount == 1) {
				FIRSTIDS.push(response.artists.items[0].id);
				var firstHTML = '<h3>' + response.artists.items[0].name + '</h3>';
				$('.first-degree').html(firstHTML);
			} else {
				SECONDIDS.push(response.artists.items[0].id);
				var sixthHTML = '<h3>' + response.artists.items[0].name + '</h3>'
				$('.sixth-degree').html(sixthHTML);
			}

			searchRecommendations(response.artists.items[0].id, degree, artistCount);
		}
	});
}

function searchRecommendations(artist, degree, artistCount) {
	if( degree == DEGREES ){
			// renderMatches(); 
		return; 
	} else { 
		return setTimeout(function() {  //setTimeout not necessary, just for clairity and potential visual FX
			$.ajax({
				url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
				data: {
					type: 'artist',
				},
				success: function (response) {
					var color = "#"+((1<<24)*Math.random()|0).toString(16);

					$(response.artists).each(function(){						
						if (artistCount == 1 && FIRSTIDS.indexOf(this.id) == -1) {
								if (degree == 0) {
									var secondHTML = '<h5 style="color:'+color+'">' + this.name + '</h5>';
									$('.second-degree').append(secondHTML);
									FIRSTIDS.push(this.id);
									ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
									searchRecommendations(this.id, degree+1, artistCount)
							} else {
								var thirdHTML = '<h5 style="color:'+color+'">' + this.name + '</h5>';
								$('.third-degree').append(thirdHTML);
								FIRSTIDS.push(this.id);
								ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
								searchRecommendations(this.id, degree+1, artistCount);
							}
						} else if (SECONDIDS.indexOf(this.id) == -1 && artistCount == 2) {
								if (degree == 0) {
									var fifthHTML = '<h5 style="color:'+color+'">' + this.name + '</h5>';
									$('.fifth-degree').append(fifthHTML);
									SECONDIDS.push(this.id);
									ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
									searchRecommendations(this.id, degree+1, artistCount)
							} else {
								var fourthHTML = '<h5 style="color:'+color+'">' + this.name + '</h5>';
								$('.fourth-degree').append(fourthHTML);
								SECONDIDS.push(this.id);
								ARTISTS.push(this); //You can add unique identifiers here, depending on degree #.
								searchRecommendations(this.id, degree+1, artistCount);							
						}
					}
				});
				}		
			});	
		},300,degree)
	}
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
			$('.matched-artists').append(matchesHTML);
		}
	});
	$('.matches').removeClass('hidden');
}
