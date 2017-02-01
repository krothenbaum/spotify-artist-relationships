var DEGREES = 2; //Maximum levels queried; starts at zero

var MAXARTISTS = 2;

var ARTISTS = [];  //Array with the number of potential 'artists' i.e. compare Madonna, to Beethoven to Eminem to nth-artist

var IDS = [];

$(function(){
	nextLevel(0) //Auto Start for testing
	//get input from User and call nextLevel for each Artist building a relationship tree equal to the number of Degrees
})

var nextLevel = function(degree){ //Recursion 
	if( degree == DEGREES ){
		setTimeout(function() {
			renderResults();
			return console.log('max level');
		}, 1000);
	} else {
		return setTimeout(function() {  //setTimeout not necessary, just for clairity and potential visual FX
				addNewArtist('alkaline trio', degree);	//manually seed artist for testing
				nextLevel(degree+1); 	
		}, 500)
	}
}

//first degree find the single artist. Following degree search recommendations for each artist in that degree's Array index
function addNewArtist(artist, degree){
	if (degree === 0) {
		searchArtist(artist, degree);
	} else {
		ARTISTS[degree].artists.forEach(function(item) {
				searchRecommendations(item.id, degree);
		});
	}
}

//search for the artist the user inputs
function searchArtist(artist, degree) {
	$.ajax({
		url: 'https://api.spotify.com/v1/search',
		data: {
			q: artist,
			type: 'artist'
		},
			success: function (response) {
				ARTISTS[degree] = response;
				IDS.push(response.artists.items[0].id);
				//get recommendations on the first result of artist search
				searchRecommendations(response.artists.items[0].id, degree);
		}
	});
}

function searchRecommendations(artist, degree) {
	$.ajax({
		url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
		data: {
			type: 'artist',
		},
		success: function (response) {
			//check if artist id is in ID array, remove if so, add if not
			console.log(typeof response);
			var tempArr = [];
			for(var i = 0; i < response.artists.length; i++) {
				if(IDS.indexOf(response.artists[i].id) == -1) {
					IDS.push(response.artists[i].id);
					tempArr.push(response.artists[i]);
				} 
			}
			// add the result to next index in the array
			ARTISTS.push(tempArr);
		}		
	});	
}

function renderResults() {
	for(var i = 0; i < ARTISTS.length; i++) {		
		if(i === 0) {
			var firstHTML = '<h3>' + ARTISTS[i].artists.items[i].name + '</h3>';
			$('.first-degree').html(firstHTML);
		} else if (i === 1) {
			var secondHTML = '';
			ARTISTS[i].artists.forEach(function(artist) {
				secondHTML = '<h5 class="truncate">' + artist.name + '</h5>';
				$('.second-degree').append(secondHTML);
			});			
		} else {
			var thirdHTML = '';			
			ARTISTS[i].artists.forEach(function(artist) {
				thirdHTML = '<p class="truncate">' + artist.name + '</p>';
				$('.third-degree').append(thirdHTML);
			});			
		}
	}			
}