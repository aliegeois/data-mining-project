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
		
		for(let [url, pos_array] of song) {
			myMap.set(url, Math.min(...pos_array) < 15); // La position-pic est-elle inférieure à 15 ?
		}
	}

	return isTop15;
}

function main() {
	const raw_playlists = removeQuotes(remove13(fs.readFileSync('data/playlists.data')).toString()).split('\n');
	const raw_tracks = removeQuotes(fs.readFileSync('data/tracks.data').toString()).split('\n');
	raw_playlists.pop(); // La dernière ligne est vide, il faut la supprimer
	raw_tracks.pop();

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
		for(let j = 0; j < line.length; j++)
			playlists[playlist_headers[j]].push(line[j]); // Enlever les guillemets
	}

	for(let i = 1; i < raw_tracks.length; i++) {
		let line = raw_tracks[i].split('\t');
		for(let j = 0; j < line.length; j++)
			tracks[tracks_headers[j]].push(line[j]);
	}
	
	let positions = getPositions(playlists);
	let isTop15 = getIsTop15(positions);

	console.log(isTop15);
}

main();