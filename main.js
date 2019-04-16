const fs = require('fs');

function removeQuotes(data) { // Gère les guillemets
	let clean = '',
		string = false,
		escaped = false;
	for(let ch of data) {
		if(string) {
			if(escaped) {
				clean += ch;
				escaped = false;
			} else if(ch === '\\') {
				escaped = true;
			} else if(ch === '"') {
				string = true;
			} else {
				clean += ch;
			}
		} else if(ch === '"') {
			string = true;
		} else {
			clean += ch;
		}
	}

	return clean;
}

function remove13(buffer) { // Enlève les retours chariot
	let clean = [];
	for(let i of buffer) {
		if(i !== 13)
			clean.push(i);
	}

	return Buffer.from(clean);
}

/**
 * Position-pic, 2.1, 1er tiret
 * @param {*} playlists 
 */
function getPositions(playlists) {
	/**
	 * Key 1: nom de la playlist
	 * Key 2: url de la chanson
	 * Value 2: tableau des positions de la chanson dans la playlist
	 * @type {Map<string, Map<string, number[]>>}
	 */
	let positions = new Map();
	for(let i = 0; i < playlists.length; i++) {
		let myMap;
		let type = playlists.playlist[i],
			position = playlists.position[i],
			url = playlists.url[i];

		if(positions.has(type)) {
			myMap = positions.get(type);
		} else {
			myMap = new Map();
			positions.set(type, myMap);
		}

		if(myMap.has(url)) {
			let pos = myMap.get(url);
			pos.push(position);
			myMap.set(url, pos);
		} else {
			myMap.set(url, [position]);
		}
	}

	// console.log(positions.get('fr'));

	return positions;
}

/**
 * Indicateur binaire n°1 2.1, 2ème tiret
 * @param {Map<string, Map<string, number[]>>} positions 
 */
function getIsTop15(positions) {
	/**
	 * Key 1: nom de la playlist
	 * Key 2: nom de la chanson
	 * Value 2: la chanson a-t-elle une position-pic < 15 ?
	 * @type {Map<string, Map<string, boolean>>}
	 */
	let isTop15 = new Map();
	for(let [playlist_name, song] of positions) {
		/** @type {Map<string, boolean>} */
		let myMap;
		if(isTop15.has(playlist_name)) {
			myMap = isTop15.get(playlist_name);
		} else {
			myMap = new Map();
			isTop15.set(playlist_name, myMap);
		}
		
		for(let [url, pos_array] of song)
			myMap.set(url, Math.min(...pos_array) < 15); // La position-pic est-elle inférieure à 15 ?
	}

	return isTop15;
}


/**
 * Temps pendant lequel la chanson est apparu dans la playlist en nombre de semaine 2.1 3ème tiret
 * Key 1 : nom de la playlist
 * Key 2 : url de la chanson
 * Value finale : list des positions d'une chanson pour une playlist
 * @param {Map<string, Map<string, number[]>>} songs
 * Key 1 : nom de la playlist
 * Key 2 : url de la chanson
 * Value finale : temps pendant laquelle la chanson est apparue dans la playlist (nombre de semaines)
 * @returns {Map<string, Map<string, number>>}
 */
function getTimeAppeared(positions) {

	let times = new Map();

	// Pour chaque playlist
	positions.forEach((value, key) => {
		let timesPlaylist = new Map();

		// Pour chaque chanson dans la playlist value
		value.forEach((value, key) => {
			let timeURL = value.length;
			timesPlaylist[key] = timeURL;
		});

		times[key] = timesPlaylist;
	});

	return times;

}


/**
 * Indicateur binaire n°1 2.1, 2ème tiret
 * Key 1 : nom de la playlist
 * Key 2 : url de la chanson
 * Value finale : list des positions d'une chanson pour une playlist
 * @param {Map<string, Map<string, number[]>>} positions 
 */
function getMeanPosition(positions) {
	/**
	 * Key 1: nom de la playlist
	 * Key 2: nom de la chanson
	 * Value 2: la valeur moyenne ?
	 * @type {Map<string, Map<string, boolean>>}
	 */

	let meanPositions = new Map();
	for(let [playlist_name, song] of positions) {
		/** @type {Map<string, boolean>} */
		let myMap;
		if(meanPositions.has(playlist_name)) {
			myMap = meanPositions.get(playlist_name);
		} else {
			myMap = new Map();
			meanPositions.set(playlist_name, myMap);
		}
		
		for(let [url, pos_array] of song) {
			// On fait la moyenne 
			let mean = 0;
			pos_array.forEach(elem => {
				mean += elem;
			});
			mean /= pos_array.length;
			myMap.set(url, mean); // La moyenne des positions ?
		}
	}

	return meanPositions;
}

function main() {
	const raw_playlists = removeQuotes(remove13(fs.readFileSync('data/playlists.data')).toString()).split('\n');
	const raw_tracks = removeQuotes(fs.readFileSync('data/tracks.data').toString()).split('\n');
	raw_playlists.pop(); // La dernière ligne est vide, il faut la supprimer
	raw_tracks.pop();

	/** @type {{position: number[], title: string[], artists: string[], url: string[], date: Date[], playlist: string[]}} */
	let playlists = {},
		playlist_headers = raw_playlists[0].split('\t'), // On supprime les guillemets des headers
		tracks = {},
		tracks_headers = raw_tracks[0].split('\t');

	for(let header of playlist_headers)
		playlists[header] = [];
	playlists.length = raw_playlists.length - 1;
	
	for(let header of tracks_headers)
		tracks[header] = [];
	tracks.length = raw_tracks.length - 1;
	
	for(let i = 1; i < raw_playlists.length; i++) {
		let line = raw_playlists[i].split('\t');
		for(let j = 0; j < line.length; j++) {
			let value;
			switch(playlist_headers[j]) {
			case 'position':
				value = parseInt(line[j]); // On convertit en int
				break;
			case 'date':
				value = new Date(line[j]); // On convertit en date
				break;
			default:
				value = line[j]; // On ne convertit pas
			}
			playlists[playlist_headers[j]].push(value);
		}
	}

	for(let i = 1; i < raw_tracks.length; i++) {
		let line = raw_tracks[i].split('\t');
		for(let j = 0; j < line.length; j++) {
			let value;
			switch(tracks_headers[j]) {
			case 'BPM':
				value = parseInt(line[j]);
				break;
			case 'Mode':
				if(line[j] === 'Major')
					value = true;
				else if(line[j] === 'Minor')
					value = false;
				else
					value = null;
				break;
			case 'Danceability':
			case 'Valence':
			case 'Energy':
			case 'Acousticness':
			case 'Instrumentalness':
			case 'Liveness':
			case 'Speechiness':
				value = parseInt(line[j]) / 100;
				break;
			default:
				value = line[j];
			}
			tracks[tracks_headers[j]].push(value);
		}
	}
	
	/* A partir de là, on a le tableau des positions bien formé */
	let positions = getPositions(playlists);
	let isTop15 = getIsTop15(positions);
	let timeAppeared = getTimeAppeared(positions);
	let meanPositions = getMeanPosition(positions);
	console.log(meanPositions);
}

main();

