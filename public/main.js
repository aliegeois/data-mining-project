onload = () => {
	const result = document.getElementById('result');
	const description = document.getElementById('description');

	document.getElementById('rq1').addEventListener('click', () => {
		description.innerHTML = 'Proportion des tags safe/questionable/explicit :';
		result.innerHTML = '';
		fetch('request/1')
			.then(res => res.json())
			.then(res => {
				/*let table = document.createElement('table'),
					thead = document.createElement('thead'),
					tr = document.createElement('tr'),
					name = document.createElement('th'),
					count = document.createElement('th');
				name.innerHTML = 'Type';
				count.innerHTML = 'Posts';
				tr.appendChild(name);
				tr.appendChild(count);
				thead.appendChild(tr);
				table.appendChild(thead);
				let tbody = document.createElement('tbody');
				// safe
				let trs = document.createElement('tr'),
					tdst = document.createElement('td'),
					tdsp = document.createElement('td');
				tdst.innerHTML = 'safe';
				tdsp.innerHTML = `${res.safe.toPrecision(4)*100}%`;
				trs.appendChild(tdst);
				trs.appendChild(tdsp);
				tbody.appendChild(trs);
				// questionable
				let trq = document.createElement('tr'),
					tdqt = document.createElement('td'),
					tdqp = document.createElement('td');
				tdqt.innerHTML = 'questionable';
				tdqp.innerHTML = `${res.questionable.toPrecision(4)*100}%`;
				trq.appendChild(tdqt);
				trq.appendChild(tdqp);
				tbody.appendChild(trq);
				// explicit
				let tre = document.createElement('tr'),
					tdet = document.createElement('td'),
					tdep = document.createElement('td');
				tdet.innerHTML = 'explicit';
				tdep.innerHTML = `${res.explicit.toPrecision(4)*100}%`;
				tre.appendChild(tdet);
				tre.appendChild(tdep);
				tbody.appendChild(tre);

				table.appendChild(tbody);
				
				result.appendChild(table);*/


				// Chart.defaults.scale.ticks.beginAtZero = true;
				let canvas = document.createElement('canvas');
				result.appendChild(canvas);
				new Chart(canvas, {
					type: 'doughnut',
					data: {
						labels: ['safe', 'questionable', 'explicit'],
						datasets: [{
							data: [res.safe, res.questionable, res.explicit],
							backgroundColor: ['rgba(255, 255, 59, .4)', 'rgba(255, 152, 0, .4)', 'rgba(244, 67, 54, .4)'],
							borderColor: ['rgb(255, 255, 59)', 'rgb(255, 152, 0)', 'rgb(244, 67, 54)']
						}]
					},
					options: {
						animation: {
							duration: 3000
						}
					}
				});

			});
	});

	document.getElementById('rq2').addEventListener('click', () => {
		description.innerHTML = 'Les dix utilisateurs postant le plus';
		result.innerHTML = '';
		fetch('request/2')
			.then(res => res.json())
			.then(res => {
				let table = document.createElement('table'),
					thead = document.createElement('thead'),
					tr = document.createElement('tr'),
					name = document.createElement('th'),
					count = document.createElement('th');
				name.innerHTML = 'Name';
				count.innerHTML = 'Number of posts';
				tr.appendChild(name);
				tr.appendChild(count);
				thead.appendChild(tr);
				table.appendChild(thead);
				let tbody = document.createElement('tbody');
				for(let r of res) {
					let tr = document.createElement('tr'),
						name = document.createElement('td'),
						count = document.createElement('td');
					fetch(`https://danbooru.donmai.us/users/${r.id}.json`)
						.then(res => res.json())
						.then(res => {
							name.innerHTML = res.name;
						});
					count.innerHTML = r.post_upload_count;
					tr.appendChild(name);
					tr.appendChild(count);
					tbody.appendChild(tr);
				}
				table.appendChild(tbody);
				
				result.appendChild(table);
			});
	});

	document.getElementById('rq4').addEventListener('click', () => {
		description.innerHTML = 'Les dix tags sur lesquels les dix utilisateurs postent le plus';
		result.innerHTML = '';
		fetch('request/3')
			.then(res => res.json())
			.then(res => {
				let table = document.createElement('table'),
					thead = document.createElement('thead'),
					tr = document.createElement('tr'),
					name = document.createElement('th'),
					count = document.createElement('th');
				name.innerHTML = 'Name';
				count.innerHTML = 'Number of posts';
				tr.appendChild(name);
				tr.appendChild(count);
				thead.appendChild(tr);
				table.appendChild(thead);
				let tbody = document.createElement('tbody');
				for(let r of res) {
					let tr = document.createElement('tr'),
						name = document.createElement('td'),
						count = document.createElement('td');
					name.innerHTML = r.name;
					count.innerHTML = r.post_count;
					tr.appendChild(name);
					tr.appendChild(count);
					tbody.appendChild(tr);
				}
				table.appendChild(tbody);
				
				result.appendChild(table);
			});
	});

	document.getElementById('rq6').addEventListener('click', () => {
		description.innerHTML = 'Le nombre de posts pour chaque année';
		result.innerHTML = '';
		fetch('request/4')
			.then(res => res.json())
			.then(res => {
				// res.pop();
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				new Chart(ctx, {
					type: 'line',
					data: {
						labels: res.map(e => e._id.year),
						datasets: [{
							label: 'nombre de posts',
							data: res.map(e => e.count),
							borderColor: 'rgba(255, 99, 132)',
							lineTension: .2
						}]
					}
				});
				
				result.appendChild(canvas);
			});
	});

	document.getElementById('rq7').addEventListener('click', () => {
		description.innerHTML = 'L\'évolution de la popularité des dix tags les plus populaires';
		result.innerHTML = '';
		fetch('request/5')
			.then(res => res.json())
			.then(res => {
				console.log(res);
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				let data = {},
					dataset = {};
				for(let line of res) {
					// if(line._id.year >= 2018)
					// 	continue;
					if(!data[line._id.year]) {
						data[line._id.year] = [{
							tag: line._id.tag,
							count: line.count,
							name: line.name[0].name
						}];
					} else {
						data[line._id.year].push({
							tag: line._id.tag,
							count: line.count,
							name: line.name[0].name
						});
					}
					if(!dataset[line._id.tag]) {
						dataset[line._id.tag] = [{
							year: line._id.year,
							count: line.count,
							name: line.name[0].name
						}];
					} else {
						dataset[line._id.tag].push({
							year: line._id.year,
							count: line.count,
							name: line.name[0].name
						});
					}
				}

				let colors = ['rgba(255, 99, 132)', 'rgba(54, 162, 235)', 'rgba(255, 206, 86)', 'rgba(75, 192, 192)', 'rgba(153, 102, 255)', 'rgba(255, 99, 132)', 'rgba(54, 162, 235)', 'rgba(255, 206, 86)', 'rgba(75, 192, 192)', 'rgba(153, 102, 255)'];

				new Chart(ctx, {
					type: 'line',
					data: {
						labels: Object.keys(data),
						datasets: Object.entries(dataset).map(([ tag, arr ], index) => ({
							label: arr[index].name,
							data: arr.map(line => line.count),
							backgroundColor: 'rgba(0, 0, 0, 0)',
							borderColor: colors[index]
						}))
					}
				});
				
				result.appendChild(canvas);
			});
	});

	document.getElementById('rq5').addEventListener('click', () => {
		description.innerHTML = 'Les dix tags sur lesquels l\'utilisateur postant le plus poste le plus';
		result.innerHTML = '';
		fetch('request/6')
			.then(res => res.json())
			.then(res => {
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				new Chart(ctx, {
					type: 'bar',
					data: {
						labels: res.map(e => e.name[0].name),
						datasets: [{
							label: 'nombre de posts',
							data: res.map(e => e.count),
							borderColor: 'rgba(255, 99, 132)'
						}]
					}
				});
				
				result.appendChild(canvas);
			});
	});

	document.getElementById('rq3').addEventListener('click', () => {
		description.innerHTML = 'Les dix utilisateurs ayat posté le plus gros volume de données';
		result.innerHTML = '';
		fetch('request/7')
			.then(res => res.json())
			.then(res => {
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				new Chart(ctx, {
					type: 'bar',
					data: {
						labels: ['v571866', 'CodeKyuubi', 'Schrobby', 'nanami', 'Kikimaru', 'Mr_GT', 'Rignak', 'gary25566', 'NCAA_Gundam', 'Anonymous9000'],
						datasets: [{
							label: 'volume de posts',
							data: res.map(e => e.count),
							borderColor: 'rgba(0, 0, 0)',
							backgroundColor: 'rgba(0, 0, 0, .5)'
						}]
					}
				});
				
				result.appendChild(canvas);
			});
	});

	document.getElementById('rq8').addEventListener('click', () => {
		description.innerHTML = 'Nombre de posts par mois';
		result.innerHTML = '';
		fetch('request/8')
			.then(res => res.json())
			.then(res => {
				// res.pop();
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d');
				new Chart(ctx, {
					type: 'line',
					data: {
						labels: res.map(e => e._id.month),
						datasets: [{
							label: 'nombre de posts',
							data: res.map(e => e.count),
							borderColor: 'rgba(255, 99, 132)',
							lineTension: .2
						}]
					}
				});
				
				result.appendChild(canvas);
			});
	});
};
