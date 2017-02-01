var MAX = 2; //Maximum levels queried

var ARTISTS = new Array(2);  //Multidimensional array with the number of potential 'artists' i.e. compare Madonna, to Beethoven to Eminem to nth-artist

var RELEVENT_ARTISTS = 20; //Number of relevent artists added to the list for each new artist

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

function nextLevel(level){ //Recursion 
	console.log(level)
	if( level == MAX ){
		return console.log('max level')
	} else {
		return setTimeout(function() {  //setTimeout not necessary, just for clairity and potential visual FX
				addNew(level)	
				nextLevel(level+1) 	
		},500)
	}
}



function addNew(level){
	for(var i=0; i<ARTISTS.length; i++){
		//console.log('search for '+$('input')[i].value)
		for(var j=0; j<RELEVENT_ARTISTS; j++){
			var num = Math.floor(Math.random() * 10) + 1; 
			if(typeof ARTISTS[i] != "object"){ //init the first array object - prob better way to do this 
				 ARTISTS[i] = [num]	
			} else {
				ARTISTS[i].push(num)
			}
		}
	}
	console.log(ARTISTS)	
	getMatches(ARTISTS)	
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


$(document).ready(function() {
	$('form[name="artist-form"]').submit(function (e) {
		e.preventDefault();
		ARTISTS[0] = $(this).find('#artist-1-query').val();
		var finalArtist = $(this).find('#artist-2-query').val();
		firstDegreeList.html(firstArtist);
		sixthDegreeList.html(finalArtist);
		searchArtists(finalArtist, fifthDegreeList);
		searchArtists(firstArtist, secondDegreeList);
		compareRecommendations(state);
		$('#get-recs').removeClass('hidden');
	});
})