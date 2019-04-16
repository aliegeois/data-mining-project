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
					date: line[4],
					position: line[0]
				});
			} else {
				data[line[5]][line[3]] = {
					...o, // On passe tous les attributs de o à son parent
					positions: [{
						date: line[4],
						position: line[0]
					}]
				};
			}
		} else {
			data[line[5]] = {};
			data[line[5]][line[3]] = {
				...o,
				positions: [{
					date: line[4],
					position: line[0]
				}]
			};
		}
	}

	return data;
}

let data = parseData2();
console.log(getPositions2(data));

for(let [playlist, songs] of Object.entries(data)) {
	
}

let { playlists, playlist_headers, tracks, tracks_headers } = parseData();

/* A partir de là, on a le tableau des positions bien formé */
let positions = getPositions(playlists);
let isTop15 = getIsTop15(positions);
let timeAppeared = getTimeAppeared(positions);
let meanPositions = getMeanPosition(positions);
//console.log(meanPositions);

app.use(express.static('public'));

app.get('/playlists', (req, res) => {
	res.setHeader('Content-Type', 'application/json');

});