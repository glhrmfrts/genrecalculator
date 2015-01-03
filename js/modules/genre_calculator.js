/**
 * This module does all the logic of the "calculation"
 */
Core.register('genre_calculator', function(sandbox) {

	return {

		init: function() {

			this.username = "";
			this.genre = "";
			this.userArtists = [];
			this.username = "";
			this.userArtists = [];
			this.artistRequestParams = {};
			this.topEmoArtists = [];
			this.totalMatches = 0;
			this.artistsMatches = [];
			this.percentage = 0;
			
			sandbox.listen('lastfm_username_entry', this.handleUsername.bind(this));
		},

		handleUsername: function(data) {

			this.username = data.username;
			this.genre = data.genre;
			this.getTopGenreArtists();
		},

		getTopGenreArtists: function() {
			var url = 'http://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag='+this.genre+'&api_key=ecf0412964782fd7a01500c739ea53bb&format=json&limit=100';
			sandbox.x("XHR")(url, this.setTopGenreArtists.bind(this));
		},

		setTopGenreArtists: function(data) {

			this.topEmoArtists = data.topartists.artist;
			this.getUserArtists();
		},

		getUserArtists: function() {
			var url = 'http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=ecf0412964782fd7a01500c739ea53bb&user='+ this.username +'&format=json&limit=100';
			sandbox.x("XHR")(url, this.setUserArtists.bind(this));
		},

		setUserArtists: function(data) {
			this.userArtists = data.artists.artist;
			this.calculate();
		},

		calculate: function() {

			var matches = [], self = this;
			var recomend = [];
			var totalPlayCount = 0;
			var emoPlayCount = 0;

			this.topEmoArtists.forEach(function(a) {

				var match = false;

				for (var i = 0; i < self.userArtists.length; i++) {

					var b = self.userArtists[i];

					if (a.name == b.name) {
						match = true;
						matches.push(b);
						break;
					}
				}

				if (!match && recomend.length < 30) {

					recomend.push(a);
				}
			});

			this.userArtists.forEach(function(a) {

				totalPlayCount += parseInt(a.playcount);

				for (var i = 0; i < matches.length; i++) {

					var b = matches[i];

					if (a.name == b.name) {
						emoPlayCount += parseInt(b.playcount);
						break;
					}
				}
			});

			matches.sort(this.orderMatches);

			this.totalMatches = matches.length;
			this.artistsMatches = matches;

			this.percentage = Math.round((this.totalMatches / this.userArtists.length) * 100);
			this.percentage += Math.round((emoPlayCount / totalPlayCount) * 100);

			console.log(emoPlayCount, totalPlayCount);

			this.notifyResult(recomend);
		},

		orderMatches: function(a,b) {

			return (parseInt(b.playcount) - parseInt(a.playcount));
		},

		notifyResult: function(recomend) {

			var self = this;

			sandbox.notify({
				type: 'emo_calculator_result',
				data: {
					username: self.username,
					genre: self.genre,
					userArtists: self.userArtists,
					matches: self.totalMatches,
					artistsMatches: self.artistsMatches,
					percentage: self.percentage,
					recomendations: recomend
				}
			});
		},

		destroy: function() {

		}
	}
});