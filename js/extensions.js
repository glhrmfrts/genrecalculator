Core.extend("XHR", function(url, cb) {

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.onreadystatechange = function() {

		if (xhr.readyState == 4 && xhr.status == 200) {

			var data = JSON.parse(xhr.responseText);
			cb(data);
		}
	}
	xhr.send(null);
});

Core.extend("Velocity", Velocity);