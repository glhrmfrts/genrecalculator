Core.register('background', function(s) {

	return {

		init: function() {

			this.username = 'glhrmfrts';
			this.bg = document.getElementsByClassName('background')[0];
			this.serviceUrl = 'http://ws.geonames.org/countryCode';
			this.artists = [];
			this.genres = s.x("genres");

			this.hackGetArtists();
		},

		createBackground: function() {

			for (var i = 0; i < this.artists.length; i++) {

				var artist = this.artists[i];

				var image = this.createArtistImage(artist);

				this.bg.appendChild(image);
				this.showBackground();
			}
		},

		showBackground: function() {

			var self = this;
			var i = 0;

			var show = window.setInterval(function() {

				if (i >= self.artists.length - 1) {

					window.clearInterval(show);
				}

				var c = document.getElementsByClassName('img-container')[i];

				var image = c.getElementsByTagName('img')[0];

				image.classList.add('show');

				i++;

			}, 75);

		},

		hackGetArtists: function() {

			var n = Math.floor(Math.random() * this.genres.length - 1);
			var genre = this.genres[n];

			var url = '//ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag='+genre+'&api_key=ecf0412964782fd7a01500c739ea53bb&format=json&limit=20';

			s.x("XHR")(url, this.getArtists.bind(this));
		},

		getArtists: function(data) {

			this.artists = data.topartists.artist;
			this.createBackground();
		},

		createArtistImage: function(artist) {

			var src = artist.image[4]['#text'];
			var container = document.createElement('div');

			container.className = 'img-container';
			container.innerHTML = '<img src="'+ src +'">';
			
			return container;
		}
	}
})