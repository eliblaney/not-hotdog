function displayResponse(details) {
	var app = document.getElementById("app");
	for(var i = app.children.length - 1; i >= 0; i--) {
		var item = app.children[i];
		item.className = "animate__animated animate__fadeOutUp";
		item.style.display = 'none';
	}

	var imageSrc = "/static/uploads/" + details.filename;
	var isHotdog = details.prediction === "hotdog";

	var image = new Image();
	image.src = imageSrc;
	image.className = "animate__animated animate__fadeInUp user-image";
	app.append(image);

	var text = document.createElement('h1');
	text.innerHTML = isHotdog ? 'HOTDOG' : 'NOT HOTDOG';
	text.className = isHotdog ? 'animate__animated animate__fadeInUp ishotdog'
							: 'animate__animated animate__fadeInUp nothotdog';
	app.append(text);

	var backButton = document.createElement('a');
	backButton.innerHTML = 'Back';
	backButton.href = "";
	backButton.className = "goBackButton";
	app.append(backButton);
}

function predict(file) {
	var app = document.getElementById("app");
	for(var i = app.children.length - 1; i >= 0; i--) {
		var item = app.children[i];
		item.className = "animate__animated animate__fadeOutUp";
		item.style.display = 'none';
	}

	var loading = document.createElement('h1');
	loading.innerHTML = "Loading...";
	app.append(loading);

	var xhr = new XMLHttpRequest();

	var formData = new FormData();
	formData.append("file", file);
	formData.append('API_KEY', 'fce56ab4-666e-4cdf-9bd0-e12e1b580c11');

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
	xhr.onreadystatechange = function(e) {
		if(xhr.readyState == 4) {
			displayResponse(JSON.parse(this.response));
		}
	}
	xhr.open('post', 'http://31.220.50.124/predict', true);
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

function fileHandler(event) {
	if (event.files) {
		predict(event.files[0]);
	}
}
