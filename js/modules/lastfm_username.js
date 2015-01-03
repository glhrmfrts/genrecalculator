/**
 * This module handles the selection of the genre and the form submission
 */
Core.register('lastfm_username', function(sandbox) {

	return {

		init: function() {

			this.genres = [
				"emo",
				"indie",
				"alternative",
				"rock",
				"eletronic",
				"hard-rock",
				"k-pop"
			];

			this.entry = document.getElementById('username');
			this.genreText = "How much <genre> you are?";
			this.selectedGenre = 0;
			this.genreTextElem = document.getElementById('genre_text');

			this.addGenreListeners();

			var form = document.getElementById('calculator');
			form.addEventListener('submit', this.onSubmit.bind(this));

			sandbox.listen('read_cookie_username', this.handleCookieUsername.bind(this));
		},

		onSubmit: function(e) {

			e.preventDefault();

			var btn = document.getElementById('submit_username');
			btn.setAttribute('disabled', "true");
			btn.innerText = "Calculating..."

			var username = this.entry.value;
			var genre = this.genres[this.selectedGenre];

			if (username != "") {
				sandbox.notify({
					type: 'lastfm_username_entry',
					data: {
						username: username,
						genre: genre
					}
				});
			}
		},

		addGenreListeners: function() {
			var prev = document.getElementById('prev_genre');
			var next = document.getElementById('next_genre');

			prev.addEventListener('click', this.prevGenre.bind(this));
			next.addEventListener('click', this.nextGenre.bind(this));
		},

		handleCookieUsername: function(username) {

			this.entry.value = username;
		},

		prevGenre: function() {

			if (this.selectedGenre > 0)
				this.selectedGenre -= 1;
			else
				this.selectedGenre = this.genres.length-1;

			this.updateGenreTextElem('prev');
		},

		nextGenre: function() {

			if (this.selectedGenre < this.genres.length-1)
				this.selectedGenre += 1;
			else
				this.selectedGenre = 0;

			this.updateGenreTextElem('next');
		},

		updateGenreTextElem: function(dir) {

			var self = this;

			var genre = self.genres[self.selectedGenre];
			var titleGenre = genre.split('');
			titleGenre[0] = titleGenre[0].toUpperCase();
			document.title = titleGenre.join('') + ' Calculator';

			sandbox.x("Velocity")(this.genreTextElem, {opacity: 0}, 200);
			window.setTimeout(function() {

				self.genreTextElem.innerHTML = self.genreText.replace("<genre>", genre);
				sandbox.x("Velocity")(self.genreTextElem, {opacity: 1}, 200);

			}, 200);
		},

		destroy: function() {

		}
	}
});