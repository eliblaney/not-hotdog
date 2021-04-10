function predict(file) {
	var xhr = new XMLHttpRequest();

	var formData = new FormData();
	formData.append("file", file);

	xhr.addEventListener('progress', function(e) {
		var done = e.position || e.loaded
		var total = e.totalSize || e.total;
		console.log('progress: ' + (Math.floor(done/total*1000)/10) + '%');
	});
	if ( xhr.upload ) {
		xhr.upload.onprogress = function(e) {
			var done = e.position || e.loaded
			var total = e.totalSize || e.total;
			console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + (Math.floor(done/total*1000)/10) + '%');
		};
	}
	xhr.onreadystatechange = e => {
		console.log("FINISHED");
		console.log(e);
	}
	xhr.open('post', 'http://127.0.0.1/predict', true);
	xhr.setRequestHeader('Content-Type', 'multipart/form-data');
	xhr.send(formData);
}

function dropHandler(event) {
	event.preventDefault();

	if (event.dataTransfer.items) {
		if (event.dataTransfer.items[0].kind === 'file') {
			var file = event.dataTransfer.items[0].getAsFile();
			predict(file);
		}
	} else {
		predict(event.dataTransfer.files[0]);
	}
}

function dragOverHandler(event) {
	event.preventDefault();
}
