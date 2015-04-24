Core.extend("XHR", function(url, cb, error, params) {

	var xhr = new XMLHttpRequest();

	if (params) {

		url += '?';

		for (var key in params) {

			url += key +'='+ params[key] +'&';
		}
	}

	xhr.open('GET', url, true);
	xhr.onreadystatechange = function() {

		if (xhr.readyState == 4 && xhr.status == 200) {

			var data = JSON.parse(xhr.responseText);
			cb(data);
		} else {

			error();
		}
	}

	xhr.send(null);
});

Core.extend("genres", 
	[
		"pop",
		"rock",
		"emo",
		"indie",
		"alternative",
		"pop rock",
		"eletronic",
		"hard-rock",
		"metal",
		"indie rock",
		"folk",
		"synth pop",
		"idm",
		"post-rock",
		"jazz",
		"vaporwave",
		"k-pop"
	]
);

Core.extend("Velocity", Velocity);
