var artistArray = [];

function searchArtist(artist) {
	$.ajax({
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: artist,
			type: 'artist'
		},
			success: function (response) {
				console.log(response);
				searchRecommendations(response);
		}
	});
}

function searchArtists(artists) {
	$.ajax({
		url: 'https://api.spotify.com/v1/artists',
		data: {
			ids: artists
		},
			success: function (response) {
				console.log(response);
		}
	});
}

function searchRecommendations(artist) {
	$.ajax({
		url: 'https://api.spotify.com/v1/artists/' + artist.artists.items[0].id + '/related-artists',
		data: {
			type: 'artist',
		},
		success: function (response) {
			
			var strArtists = '';
			response.artists.forEach(function(item) {
				strArtists = strArtists + item.id + ',';
			});
			strArtists = strArtists.slice(0, -1);
			console.log(strArtists);
			searchArtists(strArtists);
		}		
	});	
}

$(document).ready(function(){
	var artist ='alkaline trio';
	searchArtist(artist);
})