var DEGREES = 2; //Maximum levels queried; starts at zero

var MAXARTISTS = 2;

var ARTISTS = [];  //Multidimensional array with the number of potential 'artists' i.e. compare Madonna, to Beethoven to Eminem to nth-artist



$(function(){
	nextLevel(0) //Auto Start for testing
	//get input from User and call nextLevel for each Artist building a relationship tree equal to the number of Degrees
})

var nextLevel = function(degree){ //Recursion 
	if( degree == DEGREES ){
		console.log(ARTISTS);
		return console.log('max level');		
	} else {
		return setTimeout(function() {  //setTimeout not necessary, just for clairity and potential visual FX
				addNewArtist('alkaline trio', degree);	//manually seed artist for testing
				nextLevel(degree+1); 	
		},500)
	}
}



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
			//add the result to next index in the array
			ARTISTS.splice((degree+1), 0, response);
		}		
	});	
}



var getMatches = function(ARTISTS){  
	var arrays = ARTISTS.slice(); //This is needed to clone the array and make a new reference 
	var result = arrays.shift().reduce(function(res, v) {  //Fancy Pants Answer - http://stackoverflow.com/questions/11076067/finding-matches-between-multiple-javascript-arrays
	    if (res.indexOf(v) === -1 && arrays.every(function(a) { //EXTRA CREDIT - Try to find if only some the artist arrays have matches, or which arrays match.  Say artist A with artist D match for value 'blah blah'; 
		return a.indexOf(v) !== -1;
	    })) 
	    res.push(v);
	    return res;
	}, ['matches:']);

	console.log(result)

}


