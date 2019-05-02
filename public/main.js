onload = () => {

	document.getElementById('question2_1_1').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_1_1');
		result.innerHTML = '';
		fetch('/getPositionsPic')
			.then(res => res.json())
			.then(res => {

				for(let [playlist, songsUrl] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode(playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [songsURL, positionPic] of Object.entries(songsUrl)) {
						let elemLine = document.createElement('p');
						elemLine.innerHTML = songsURL + ' : ' + '<span class="toBold">' + positionPic + '</span>';
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});

	document.getElementById('question2_1_2').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_1_2');
		result.innerHTML = '';
		fetch('/getIsTop15')
			.then(res => res.json())
			.then(res => {
				
				for(let [playlist, songsUrl] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode(playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [songsURL, isTop15] of Object.entries(songsUrl)) {
						let elemLine = document.createElement('p');
						if(isTop15 == true) {
							elemLine.innerHTML = '<span class="colorTrue">' + songsURL + '<span class="toBold"> : ' + isTop15 + '</span> </span>';
						} else {
							elemLine.innerHTML = '<span class="colorFalse">' + songsURL + '<span class="toBold"> : ' + isTop15 + '</span> </span>';
						}
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});

	document.getElementById('question2_1_3').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_1_3');
		result.innerHTML = '';
		fetch('/getTimeAppeared')
			.then(res => res.json())
			.then(res => {

				for(let [playlist, songsUrl] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode(playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [songsURL, timeAppeared] of Object.entries(songsUrl)) {
						let elemLine = document.createElement('p');
						elemLine.innerHTML = songsURL + ' : ' + '<span class="toBold">' + timeAppeared + '</span>';
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});

	document.getElementById('question2_1_4').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_1_4');
		result.innerHTML = '';
		fetch('/getMeanPositions')
			.then(res => res.json())
			.then(res => {

				for(let [playlist, songsUrl] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode(playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [songsURL, meanPosition] of Object.entries(songsUrl)) {
						let elemLine = document.createElement('p');
						elemLine.innerHTML = songsURL + ' : ' + '<span class="toBold">' + meanPosition + '</span>';
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});

	document.getElementById('question2_1_5').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_1_5');
		result.innerHTML = '';
		fetch('/getMeanPosInf15')
			.then(res => res.json())
			.then(res => {
				
				for(let [playlist, songsUrl] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode(playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [songsURL, isTop15] of Object.entries(songsUrl)) {
						let elemLine = document.createElement('p');
						if(isTop15 == true) {
							elemLine.innerHTML = '<span class="colorTrue">' + songsURL + '<span class="toBold"> : ' + isTop15 + '</span> </span>';
						} else {
							elemLine.innerHTML = '<span class="colorFalse">' + songsURL + '<span class="toBold"> : ' + isTop15 + '</span> </span>';
						}
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});

	document.getElementById('question2_2_2').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_2_2');
		result.innerHTML = '';
		fetch('/getMeanMusics')
			.then(res => res.json())
			.then(res => {

				for(let [playlist, musicCaracteristics] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode('Profil de la chanson ' + playlist + ' moyenne');
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [key, value] of Object.entries(musicCaracteristics)) {
						let elemLine = document.createElement('p');
						elemLine.innerHTML = key + ' : ' + value;
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});

	document.getElementById('question2_2_3').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_2_3');
		result.innerHTML = '';
		fetch('/getBestMeanPositionSong')
			.then(res => res.json())
			.then(res => {

				for(let [playlist, music] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode('Meilleure chanson ' + playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [key, value] of Object.entries(music)) {
						let elemLine = document.createElement('p');
						elemLine.innerHTML = key + ' : ' + value;
						elemPlaylist.appendChild(elemLine);
					}

					result.appendChild(elemPlaylist);
				}

			});
	});
	
};
