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
 * @param {*} data 
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
 * 2.1 - 1er tiret
 * @param {*} data 
 */
function getPositionsPic(data) {

	let positionsPic = {};
	for(let [playlist, songs] of Object.entries(data)) { // Pour chaque playlist
		let positionsPicByPlaylist = {};
		for(let [song_url, song_data] of Object.entries(songs)) { // Pour chaque musique
			let bestPosition = Number.MAX_SAFE_INTEGER; // On initialise la position pic à un très grand nombre
			for(let positions of Object.values(song_data.positions)) { // Pour toute les positions
				if(positions.position < bestPosition) { // Si on trouve une meilleure position, on modifie
					bestPosition = positions.position; 
				}
			}
			positionsPicByPlaylist[song_url] = bestPosition;
		}
		positionsPic[playlist] = positionsPicByPlaylist;
	}
	return positionsPic;
}

/**
 * Indicateur binaire n°1 2.1, 2ème tiret
 */
function getIsTop15(positionsPic) {
	
	let isTop15 = {};
	for(let [playlist, songsUrl] of Object.entries(positionsPic)) { // Pour chaque playlist
		let isTop15PlaylistRelativ = {};
		for(let [songsURL, positionPic] of Object.entries(songsUrl)) { // Pour chaque chanson
			isTop15PlaylistRelativ[songsURL] = (positionPic < 15);
		}
		isTop15[playlist] = isTop15PlaylistRelativ;
	}

	return isTop15;
	

	
	
	/**
	 * Key 1: nom de la playlist
	 * Key 2: nom de la chanson
	 * Value 2: la chanson a-t-elle une position-pic < 15 ?
	 * @type {Map<string, Map<string, boolean>>}
	 */
	// let isTop15 = {};
	// for(let [playlist_name, song] of Object.entries(positions)) {
	// 	let _map;
	// 	if(isTop15.hasOwnProperty(playlist_name)) {
	// 		_map = isTop15[playlist_name];
	// 	} else {
	// 		_map = {};
	// 		isTop15[playlist_name] = _map;
	// 	}
		
	// 	for(let [url, pos_array] of Object.entries(song))
	// 		_map[url] = Math.min(...pos_array) < 15; // La position-pic est-elle inférieure à 15 ?
	// }

	// return isTop15;
}

/**
 * 2.1 3ème tiret
 * Temps pendant lequel la chanson est apparu dans la playlist en nombre de semaine
 * Data est un object js pouvant être envisagé comme une Map avec pour clé une string (le nom de la playlist), et comme valeur une map
 * avec comme clé une sting (l'url de la chanson) et comme value un object avec divers attributs comme le titre, le Liveness, la liste
 * ses positions...
 * @param {Object} data
 */
function getTimeAppeared(data) {

	let times = {};

	for(let [playlist, song] of Object.entries(data)) { // Pour chaque playlist
		let times_playlistSpecific = {};
		for(let [songURL, songData] of Object.entries(song)) { // Pour chaque chanson
			times_playlistSpecific[songURL] = songData.positions.length; // songData.positions est la liste des positions de la chanson au fil du temps
		}
		times[playlist] = times_playlistSpecific;
	}

	return times;

}

/**
 * 2.1 4ème tiret
 * Position moyenne de la chanson pendant qu'elle était dans la playlist
 * Data est un object js pouvant être envisagé comme une Map avec pour clé une string (le nom de la playlist), et comme valeur une map
 * avec comme clé une sting (l'url de la chanson) et comme value un object avec divers attributs comme le titre, le Liveness, la liste
 * ses positions...
 * @param {Object} data
 */
function getMeanPositions(data) {
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
			let mean = pos_array.reduce((a, b) => a + b);
			mean /= pos_array.length;
			myMap[url] = mean; // La moyenne des positions ?
		}
	}

	return meanPositions;
}

/**
 * Indication de si la chanson a une position moyenne infèrieure à 15.
 * Le paramètre est un object pouvant être vu comme une map avec comme key
 * le nom de la playlist et comme value une map avec comme key l'url de la
 * chanson et comme valeur la position moyenne. C'est ce qui nous est renvoyé
 * par la fonction getMeanPosition
 * @param {Object} data
 * Prend positions en paramètres
 */
function getMeanPosInf15(meanPos) {
	let meanPosInf15 = {};

	for(let [playlist_name, song] of Object.entries(meanPos)) {
		let meanPosInf15_playlistSpecific = {};
		for( let [song_url, mean] of Object.entries(song)) {
			meanPosInf15_playlistSpecific[song_url] = (mean < 15);
		}
		meanPosInf15[playlist_name] = meanPosInf15_playlistSpecific;
	}
	
	return meanPosInf15;
}

function addColumns(data) {
	let d2 = {};
	for(let [playlist, songs] of Object.entries(data)) {
		d2[playlist] = {};
		for(let [url, infos] of Object.entries(songs)) {
			d2[playlist][url] = {};
			for(let [variable, valeur] of Object.entries(infos))
				d2[playlist][url][variable] = valeur;
			for(let i of ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']) {
				if(infos.Key === i)
					d2[playlist][url][i] = 1;
				else
					d2[playlist][url][i] = 0;
			}
		}
	}

	return d2;
}

function normalize(data, stats) {
	let d2 = {};
	for(let [playlist, songs] of Object.entries(data)) {
		d2[playlist] = {};
		for(let [url, infos] of Object.entries(songs)) {
			d2[playlist][url] = {};
			for(let variable of Object.keys(infos)) {
				if(['BPM', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'Mode', 'Danceability', 'Valence', 'Energy', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'].includes(variable)) {
					d2[playlist][url][variable] = (data[playlist][url][variable] - stats[playlist][variable].mean) / stats[playlist][variable].standardDeviation;
				}
			}
		}
	}

	return d2;
}

function getStats(data) { // Obtenir la moyenne, la variance et l'écart-type
	let stats = {};
	for(let [playlist, songs] of Object.entries(data)) {
		stats[playlist] = {};
		for(let infos of Object.values(songs)) {
			for(let [variable, valeur] of Object.entries(infos)) {
				if(['BPM', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'Mode', 'Danceability', 'Valence', 'Energy', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'].includes(variable)) {
					if(stats[playlist].hasOwnProperty(variable)) {
						stats[playlist][variable].mean += valeur; // Somme de tous les éléments
					} else {
						stats[playlist][variable] = {
							mean: valeur,
							variance: 0
						};
					}
				}
			}
		}
	}
	for(let [playlist, st] of Object.entries(stats)) { // Diviser la somme par le nombre d'éléments (la moyenne quoi)
		for(let variable of Object.keys(st)) {
			stats[playlist][variable].mean /= Object.keys(data[playlist]).length;
		}
	}

	for(let [playlist, songs] of Object.entries(data)) {
		for(let infos of Object.values(songs)) {
			for(let [variable, valeur] of Object.entries(infos)) {
				if(['BPM', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'Mode', 'Danceability', 'Valence', 'Energy', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'].includes(variable)) {
					stats[playlist][variable].variance += Math.pow(valeur - stats[playlist][variable].mean, 2); // Variance
				}
			}
		}
	}
	for(let [playlist, st] of Object.entries(stats)) {
		for(let variable of Object.keys(st)) {
			stats[playlist][variable].variance /= Object.keys(data[playlist]).length;
			stats[playlist][variable].standardDeviation = Math.sqrt(stats[playlist][variable].variance); // Ecart-type = sqrt(variance)
		}
	}

	return stats;
}

/**
 * 
 * @param {*} data
 */
function getMeanMusics(data) {
	let music = {};
	let keyMax = {};
	let stats = getStats(data);

	for(let [playlist, st] of Object.entries(stats)) {
		music[playlist] = {};
		keyMax[playlist] = {
			nom: '',
			valeur: 0
		};
		for(let variable of Object.keys(st)) {
			if(['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'].includes(variable)) {
				if(stats[playlist][variable].mean > keyMax[playlist].valeur) {
					keyMax[playlist] = {
						nom: variable,
						valeur: stats[playlist][variable].mean
					};
				}
			}
			music[playlist][variable] = stats[playlist][variable].mean;
		}
	}

	for(let playlist of Object.keys(stats))
		music[playlist].Key = keyMax[playlist].nom;

	return music;
}

function euclidianDistance(m1, m2) {
	let sum = 0;
	for(let i of ['BPM', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'Mode', 'Danceability', 'Valence', 'Energy', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'])
		sum += Math.pow(m1[i] - m2[i], 2);
	return Math.sqrt(sum);
}

function euclidianDistanceNormalized(m) {
	let sum = 0;
	for(let i of ['BPM', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'Mode', 'Danceability', 'Valence', 'Energy', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'])
		sum += m[i]*m[i];
	return Math.sqrt(sum);
}

/**
 * 
 * @param {*} mean Chanson moyenne (non normalisée)
 * @param {*} data Données normalisées
 */
function closestMusics(mean, data, stats, k) {
	// Normaliser
	/*let normalizedMean = {};

	for(let [playlist, infos] of Object.entries(mean)) {
		normalizedMean[playlist] = {};
		for(let [variable, valeur] of Object.entries(infos)) {
			console.log(variable, valeur, stats[playlist][variable].mean, stats[playlist][variable].standardDeviation);
			normalizedMean[playlist][variable] = (valeur - stats[playlist][variable].mean) / stats[playlist][variable].standardDeviation;
		}
	}*/

	let sortedData = {};

	for(let [playlist, songs] of Object.entries(data)) {
		sortedData[playlist] = Object.entries(songs).map(([url, infos]) => ({
			url: url,
			distance: euclidianDistanceNormalized(infos)
		})).sort((e1, e2) => e1.distance - e2.distance);
	}
	
	return Object.entries(sortedData).map(([playlist ,songs]) => ({[playlist]: songs.slice(0, k)})).reduce((x, t) => {
		Object.entries(x).forEach(([a, b])=>t[a]=b);
		return t;
	}, {});
}

/**
 * 2.2 - Analyse Exploratoire - 3ème tiret
 * Renvoie les url des chansons ayant la meilleure position moyenne pour chaque playlist.
 * Le paramètre est un object pouvant être vu comme une map avec comme key
 * le nom de la playlist et comme value une map avec comme key l'url de la
 * chanson et comme valeur la position moyenne. C'est ce qui nous est renvoyé
 * par la fonction getMeanPosition
 * @param {Object} data
 * Prend meanPositions en paramètre
 */
function getBestMeanPositionSong(meanPos) {

	let bestMeanPositionSong = {};

	for(let [playlist_name, song] of Object.entries(meanPos)) {
		let currentMean = Object.keys(song).length;
		let currentURL = '';
		for(let [song_url, mean] of Object.entries(song)) {
			if(mean < currentMean) {
				currentMean = mean;
				currentURL = song_url;
			}
		}
		bestMeanPositionSong[playlist_name] = {url : currentURL, mean : currentMean};
	}
	
	return bestMeanPositionSong;

}


/**
 * 2.2 - Analyse Exploratoire - 4ème tiret
 * Renvoie la liste des positions de la chanson song dans la playlist playlist avec leur timestamp associés
 * @param {*} data
 * @param {string} song
 * @param {string} playlist_name
 */
function getSongEvolution(data, song, playlist_name) {
	return Object.values(data[playlist_name][song].positions); // Nous retournons la liste des positions associées à la playlist et à la musique demandée
}

/**
 * 
 * @param {*} data Données (noralisées ou non)
 * @param {number} nbDimensions Nombre de dimensions
 */
function dimensionReduction(data, nbDimensions) {
	let d_array = [];
	for(let [playlist, songs] of Object.entries(data)) {
		for(let infos of Object.values(songs)) {
			for(let [variable, valeur] of Object.entries(infos)) {
				if(['BPM', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'Mode', 'Danceability', 'Valence', 'Energy', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'].includes(variable)) {
					stats[playlist][variable].variance += Math.pow(valeur - stats[playlist][variable].mean, 2); // Variance
				}
			}
		}
	}
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
					column = 1;
				else if(line[j] === 'Minor')
					column = 0;
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

let data = parseData2();
let positions = getPositions2(data);
let positionsPic = getPositionsPic(data);
let isTop15 = getIsTop15(positionsPic);
let timeAppeared = getTimeAppeared(data);
let meanPositions = getMeanPositions(data);
let meanPosInf15 = getMeanPosInf15(meanPositions);
let data2 = addColumns(data);
let stats = getStats(data2);
let normalized = normalize(data2, stats);
let meanMusics = getMeanMusics(data2);
let closest = closestMusics(meanMusics, normalized, stats, 5);


/*Object.entries(stats).forEach(([playlist, st]) => {
	console.log(Object.entries(st).sort(([vb1, vl1], [vb2, vl2]) => vl2.variance - vl1.variance));
});*/

let meanMusicsPerPlaylist = getMeanMusics(data2);
let bestMeanPositionSong = getBestMeanPositionSong(meanPositions);
let musicEvolution = getSongEvolution(data, 'https://www.spotontrack.com/track/my-own-summer-shove-it/18052', 'metal');




/* Fonctions pour le serveur */

app.use(express.static('public'));

app.get('/data.json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(data));
});


// 2_1_1
app.get('/getPositionsPic', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let positionsPic = getPositionsPic(data);
	res.end(JSON.stringify(positionsPic));
});

// 2_1_2
app.get('/getIsTop15', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let positionsPic = getPositionsPic(data);
	let isTop15 = getIsTop15(positionsPic);
	res.end(JSON.stringify(isTop15));
});

// 2_1_3
app.get('/getTimeAppeared', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let timeAppeared = getTimeAppeared(data);
	res.end(JSON.stringify(timeAppeared));
});

// 2_1_4
app.get('/getMeanPositions', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let meanPositions = getMeanPositions(data);
	res.end(JSON.stringify(meanPositions));
});

// 2_1_5
app.get('/getMeanPosInf15', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let meanPositions = getMeanPositions(data);
	let isTop15 = getMeanPosInf15(meanPositions);
	res.end(JSON.stringify(isTop15));
});


// 2_2_2
app.get('/getMeanMusics', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let meanMusics = getMeanMusics(data2);
	res.end(JSON.stringify(meanMusics));
});

// 2_2_3
app.get('/getBestMeanPositionSong', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let meanPositions = getMeanPositions(data);
	let bestMeanPositionSong = getBestMeanPositionSong(meanPositions);
	res.end(JSON.stringify(bestMeanPositionSong));
});

// 2_2_4
app.get('/getSongEvolution', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	let songEvolution = getSongEvolution(data, 'https://www.spotontrack.com/track/my-own-summer-shove-it/18052', 'metal');
	res.end(JSON.stringify(songEvolution));
});

/* Function for the notebook */
app.get('/contentFile', (req, res) => {
	res.setHeader('Content-Type', 'application/json');

	let fileName = req.header('fileName');
	console.log(fileName);
	let fileContent = fs.readFileSync(fileName).toString();
	console.log('Ce que j\'envoie : \n' + JSON.stringify(fileContent));
	res.end(JSON.stringify(fileContent));
});

app.listen(port, () => {
	console.log('Serveur online');
});








console.log(data);