function formateDate(d) {
	let date = new Date(d);
	return (date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()); // Month +1 car les mois commecent à 0
}

/*function addRapportText(questionNumber) {
	fetch('/contentFile', {
		headers: new Headers({
			'fileName': 'rapport/' + questionNumber + '.txt'
		})
	})
		.then(res => res.json())
		.then(res => {
			let rapport = document.getElementById(questionNumber + '_rapport');
			rapport.innerHTML = res;
		});
}
function addRapportCode(questionNumber) {
	fetch('/contentFile', {
		headers: new Headers({
			'fileName': 'rapport/' + questionNumber + '_code.txt'
		})
	})
		.then(res => res.json())
		.then(res => {
			let rapport = document.getElementById(questionNumber + '_code');
			rapport.innerHTML = res;
		});
}*/

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
						elemLine.innerHTML = `${songsURL} : <span class="toBold">${positionPic}</span>`;
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
						elemLine.innerHTML = `<span class="color${isTop15 ? 'True' : 'False'}">${songsURL}<span class="toBold"> : ${isTop15}</span> </span>`;
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
						elemLine.innerHTML = `${songsURL} : <span class="toBold">${timeAppeared}</span>`;
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
						elemLine.innerHTML = `${songsURL} : <span class="toBold">${meanPosition}</span>`;
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
						elemLine.innerHTML = `<span class="color${isTop15 ? 'True' : 'False'}">${songsURL}<span class="toBold"> : ${isTop15}</span> </span>`;
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

	document.getElementById('question2_2_2_closest').addEventListener('click', () => {
		console.log('a');
		const result = document.getElementById('resultQuestion2_2_2');
		result.innerHTML = '';
		fetch('/kClosestMusicsWithNormalisedData')
			.then(res => res.json())
			.then(res => {
				for(let [playlist, musics] of Object.entries(res)) {
					let elemPlaylist = document.createElement('div');
					let elemTitlePlaylist = document.createElement('h6');
					let titlePlaylist = document.createTextNode('Pour la playlist ' + playlist);
					elemTitlePlaylist.appendChild(titlePlaylist);
					elemPlaylist.appendChild(elemTitlePlaylist);

					for(let [key, value] of Object.entries(musics)) {
						// Value = line in the array
						let elemLine = document.createElement('p');
						elemLine.innerHTML = '<span style="color: #ef6c00; font-weight: bold;">Music : </span>' + value.url;
						elemPlaylist.appendChild(elemLine);
						elemLine = document.createElement('p');
						elemLine.innerHTML = 'Distance : ' + value.distance;
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

	// Création du select avec toute les chansons possibles
	
	// document.getElementById('test').addEventListener('click', () => {
	// 	let question_2_2_4_select = document.getElementById('question2_2_4_select');
	// 	fetch('/data.json')
	// 		.then(res => res.json())
	// 		.then(res => {
	// 			for(let [playlist, music] of Object.entries(res)) {
	// 				let selectCategory = document.createElement('optgroup');
	// 				selectCategory.setAttribute('label', playlist);
	// 				console.log('Playlist : ' + playlist);
	// 				for(let [musicURL, musicCaracteristics] of Object.entries(music)) {
	// 					console.log('Music : ' + musicURL);
	// 					let selectLine = document.createElement('option');
	// 					selectLine.setAttribute('value', musicURL);
	// 					selectLine.appendChild(document.createTextNode(musicURL));
	// 					selectCategory.appendChild(selectLine);
	// 				}

	// 				question_2_2_4_select.appendChild(selectCategory);
	// 			}

	// 		});
	// });
	


	document.getElementById('question2_2_4').addEventListener('click', () => {
		const result = document.getElementById('resultQuestion2_2_4');
		result.innerHTML = '';
		let s = document.getElementById('question2_2_4_select');
		let selectedSong = s[s.selectedIndex].value;
		let selectedPlaylist = s[s.selectedIndex].parentNode.getAttribute('label');

		fetch('/getSongEvolution', {
			headers: new Headers({
				'song' : selectedSong,
				'playlist' : selectedPlaylist
			})
		})
			.then(res => res.json())
			.then(res => {
				res.sort((a, b) => new Date(a.date) - new Date(b.date));

				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				new Chart(ctx, {
					type: 'line',
					options: {
						scales: {
							yAxes: [{
								ticks: {
									reverse: true,
								}
							}]
						}
					},
					data: {
						labels: res.map(e => formateDate(e.date)),
						datasets: [{
							label: 'Position',
							data: res.map(e => e.position),
							borderColor: 'rgba(255, 99, 132)',
							lineTension: .2
						}]
					}
				});
				
				result.appendChild(canvas);
			});
	});
	

	//addRapportText('2_1_1');

	/*document.getElementById('test2').addEventListener('click', () => {
		fetch('/contentFile', {
			headers: new Headers({
				'fileName': 'rapport/2_1_1.txt'
			})
		})
			.then(res => res.json())
			.then(res => {
				let rapport = document.getElementById('2_1_1_rapport');
				rapport.innerHTML = res;
			});
	});*/


	M.FormSelect.init(document.querySelectorAll('select'));
};

