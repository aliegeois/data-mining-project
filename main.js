const fs = require('fs'),
	express = require('express'),
	app = express(),
	port = 8080;

function removeQuotes(data) { // Gère les guillemets
	let clean = '',
		string = false,
		//unicode = -1,
		//str_unicode = '',
		escaped = false;
	for(let ch of data) {
		if(string) {
			/*if(unicode !== -1) {
				if(unicode === 4) {
					let _char = String.fromCharCode(parseInt(str_unicode, 16));
					clean += _char;
					console.log(str_unicode, _char);
					str_unicode = '';
					unicode = -1;
				} else {
					str_unicode += ch;
					unicode++;
				}
			} else */if(escaped) {
				/*if(ch === 'u') {
					unicode = 0;
				} else {*/
				clean += ch;
				escaped = false;
				//}
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
 * Position-pic, 2.1, 1er tiret
 * @param {*} playlists 
 */
function getPositions2(data) {
	// Object.values(data).map(playlist => Object.values(playlist).map(song => song.positions.map(pos => pos.position)));
	/**
	 * Key 1: nom de la playlist
	 * Key 2: url de la chanson
	 * Value 2: tableau des positions de la chanson dans la playlist
	 * @type {Map<string, Map<string, number[]>>}
	 */
	let positions = {};
	for(let [playlist, songs] of Object.entries(data)) {
		let _map = {};
		positions[playlist] = _map;
		for(let [url, infos] of Object.entries(songs))
			_map[url] = infos.positions.map(pos => pos.position);
	}

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
	let isTop15 = {};
	for(let [playlist_name, song] of Object.entries(positions)) {
		let _map;
		if(isTop15.hasOwnProperty(playlist_name)) {
			_map = isTop15[playlist_name];
		} else {
			_map = {};
			isTop15[playlist_name] = _map;
		}
		
		for(let [url, pos_array] of Object.entries(song))
			_map[url] = Math.min(...pos_array) < 15; // La position-pic est-elle inférieure à 15 ?
	}

	return isTop15;
}

/**
 * Temps pendant lequel la chanson est apparu dans la playlist en nombre de semaine 2.1 3ème tiret
 * Data est un object js pouvant être envisagé comme une Map avec pour clé une string (le nom de la playlist), et comme valeur une map
 * avec comme clé une sting (l'url de la chanson) et comme value un object avec divers attributs comme le titre, le Liveness, la liste
 * ses positions...
 * @param {Object} data
 */
function getTimeAppeared(data) {

	let times = {};

	for(let [playlist, song] of Object.entries(data)) {
		let times_playlistSpecific = {};
		for(let [songURL, songData] of Object.entries(song)) {
			times_playlistSpecific[songURL] = songData.positions.length; // songData.positions est la liste des positions de la chanson au fil du temps
		}
		times[playlist] = times_playlistSpecific;
	}

	// Pour chaque playlist
	// positions.forEach((value, key) => {
	// 	let timesPlaylist = new Map();

	// 	// Pour chaque chanson dans la playlist value
	// 	value.forEach((value, key) => {
	// 		let timeURL = value.length;
	// 		timesPlaylist[key] = timeURL;
	// 	});

	// 	times[key] = timesPlaylist;
	// });

	return times;

}

/**
 * Temps pendant lequel la chanson est apparu dans la playlist en nombre de semaine 2.1 3ème tiret
 * Data est un object js pouvant être envisagé comme une Map avec pour clé une string (le nom de la playlist), et comme valeur une map
 * avec comme clé une sting (l'url de la chanson) et comme value un object avec divers attributs comme le titre, le Liveness, la liste
 * ses positions...
 * @param {Object} data
 */
function getMeanPosition(data) {
	let meanPositions = {};
	for(let [playlist_name, song] of Object.entries(positions)) {
		let myMap;
		if(meanPositions.hasOwnProperty(playlist_name)) {
			myMap = meanPositions[playlist_name];
		} else {
			myMap = {};
			meanPositions[playlist_name] = myMap;
		}
		
		for(let [url, pos_array] of Object.entries(song)) {
			// On fait la moyenne 
			/*let mean = 0;
			pos_array.forEach(elem => {
				mean += elem;
			});*/
			let mean = pos_array.reduce((a, b) => a + b);
			mean /= pos_array.length;
			myMap[url] = mean; // La moyenne des positions ?
		}
	}

	return meanPositions;
}

function parseData() {
	const raw_playlists = removeQuotes(remove13(fs.readFileSync('data/playlists.data')).toString()).split('\n');
	const raw_tracks = removeQuotes(fs.readFileSync('data/tracks.data').toString()).split('\n');
	raw_playlists.pop(); // La dernière ligne est vide, il faut la supprimer
	raw_tracks.pop();

	/** @type {{position: number[], title: string[], artists: string[], url: string[], date: Date[], playlist: string[]}} */
	let playlists = {};
	/** @type {string[]} */
	let playlist_headers = raw_playlists[0].split('\t'); // On supprime les guillemets des headers
	//** @type {{url: string, BPM: number, Key: string, Mode: boolean, Danceability: number, Valence: number, Energy: number, Acousticness: number, Instrumentalness: number, Liveness: number, Speechiness: number}} */
	let tracks = {};
	/** @type {string[]} */
	let tracks_headers = raw_tracks[0].split('\t');

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
		/** @type {{BPM: number, Key: string, Mode: boolean, Danceability: number, Valence: number, Energy: number, Acousticness: number, Instrumentalness: number, Liveness: number, Speechiness: number}} */
		let value = {};
		for(let j = 0; j < line.length; j++) {
			let column;
			switch(tracks_headers[j]) {
			case 'BPM':
				column = parseInt(line[j]);
				break;
			case 'Mode':
				if(line[j] === 'Major')
					column = true;
				else if(line[j] === 'Minor')
					column = false;
				else
					column = null;
				break;
			case 'Danceability':
			case 'Valence':
			case 'Energy':
			case 'Acousticness':
			case 'Instrumentalness':
			case 'Liveness':
			case 'Speechiness':
				column = parseInt(line[j]) / 100;
				break;
			default:
				column = line[j];
			}
			value[tracks_headers[j]] = column;
			// tracks[tracks_headers[j]].push(value);
		}
		tracks[line[0]] = value;
	}

	fs.writeFile('playlists_unicode', JSON.stringify(playlists), err => {
		if(err)
			throw err;
	});

	return { playlists, playlist_headers, tracks, tracks_headers };
}


function parseData2() {
	const raw_playlists = removeQuotes(remove13(fs.readFileSync('data/playlists.data')).toString()).split('\n');
	const raw_tracks = removeQuotes(fs.readFileSync('data/tracks.data').toString()).split('\n');
	raw_playlists.pop(); // La dernière ligne est vide, il faut la supprimer
	raw_tracks.pop();

	let data = {};
	/** @type {string[]} */
	let playlist_headers = raw_playlists[0].split('\t'); // On supprime les guillemets des headers
	let tracks = {};
	/** @type {string[]} */
	let tracks_headers = raw_tracks[0].split('\t');


	for(let i = 1; i < raw_tracks.length; i++) {
		let line = raw_tracks[i].split('\t');
		/** @type {{BPM: number, Key: string, Mode: boolean, Danceability: number, Valence: number, Energy: number, Acousticness: number, Instrumentalness: number, Liveness: number, Speechiness: number}} */
		let value = {};
		for(let j = 0; j < line.length; j++) {
			let column;
			switch(tracks_headers[j]) {
			case 'BPM':
				column = parseInt(line[j]);
				break;
			case 'Mode':
				if(line[j] === 'Major')
					column = true;
				else if(line[j] === 'Minor')
					column = false;
				else
					column = null;
				break;
			case 'Danceability':
			case 'Valence':
			case 'Energy':
			case 'Acousticness':
			case 'Instrumentalness':
			case 'Liveness':
			case 'Speechiness':
				column = parseInt(line[j]) / 100;
				break;
			default:
				column = line[j];
			}
			if(tracks_headers[j] !== 'url')
				value[tracks_headers[j]] = column;
			// tracks[tracks_headers[j]].push(value);
		}
		tracks[line[0]] = value;
	}

	for(let i = 1; i < raw_playlists.length; i++) {
		let line = raw_playlists[i].split('\t');

		let o = { // Déstructuration des objets
			...{ title: line[1], artists: line[2] },
			...tracks[line[3]]
		};
		if(data.hasOwnProperty(line[5])) {
			if(data[line[5]].hasOwnProperty(line[3])) {
				data[line[5]][line[3]].positions.push({
					date: new Date(line[4]),
					position: parseInt(line[0])
				});
			} else {
				data[line[5]][line[3]] = {
					...o, // On passe tous les attributs de o à son parent
					positions: [{
						date: new Date(line[4]),
						position: parseInt(line[0])
					}]
				};
			}
		} else {
			data[line[5]] = {};
			data[line[5]][line[3]] = {
				...o,
				positions: [{
					date: new Date(line[4]),
					position: parseInt(line[0])
				}]
			};
		}
	}

	return data;
}

// let { playlists, playlist_headers, tracks, tracks_headers } = parseData();

/* A partir de là, on a le tableau des positions bien formé */
let data = parseData2();
let positions = getPositions2(data);
let isTop15 = getIsTop15(positions);
let timeAppeared = getTimeAppeared(data);
let meanPositions = getMeanPosition(data);
console.log(meanPositions);

app.use(express.static('public'));

app.get('/playlists', (req, res) => {
	res.setHeader('Content-Type', 'application/json');

});