var DEGREES = 2; //Maximum levels queried; starts at zero

var MAXARTISTS = 2;

var ARTISTS = [];  //Array with the number of potential 'artists' i.e. compare Madonna, to Beethoven to Eminem to nth-artist


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
			//instead of splicing the results to the array and increasing its length I would like to append the results to the current index.
		}		
	});	
}



// var getMatches = function(ARTISTS){  
// 	var arrays = ARTISTS.slice(); //This is needed to clone the array and make a new reference 
// 	var result = arrays.shift().reduce(function(res, v) {  //Fancy Pants Answer - http://stackoverflow.com/questions/11076067/finding-matches-between-multiple-javascript-arrays
// 	    if (res.indexOf(v) === -1 && arrays.every(function(a) { //EXTRA CREDIT - Try to find if only some the artist arrays have matches, or which arrays match.  Say artist A with artist D match for value 'blah blah'; 
// 		return a.indexOf(v) !== -1;
// 	    })) 
// 	    res.push(v);
// 	    return res;
// 	}, ['matches:']);

// 	console.log(result)

// }

// function scrubArray(ARTISTS) {
// 	alert('Scrub');
// 	console.log(ARTISTS.length);
// 	for(var i = 2; i < ARTISTS.length; i++) {
// 		console.log(ARTISTS[i].artists);
// 		for(var j = 0; j < ARTISTS[i].artists.length; j++) {
// 			for(var k = 0; k < ARTISTS[i-1].artists.length; k++) {
// 				if(ARTISTS[i].artists[j].id === ARTISTS[i-1].artists[k].id) {
// 					ARTISTS[i].artists[j].splice(j, 1);
// 				}
// 			}
// 		}
// 	}
// }