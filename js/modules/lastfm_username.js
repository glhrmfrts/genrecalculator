/**
 * This module handles the selection of the genre and the form submission
 */
Core.register('lastfm_username', function(sandbox) {

	return {

		init: function() {

			this.genres = sandbox.x("genres");

			this.entry = document.getElementById('username');
			this.genreText = "How much <genre> you are?";
			this.selectedGenre = 0;
			this.selectInput = document.getElementById('genre');
			this.genreTextElem = document.getElementById('genre_text');

			this.addGenreListeners();
			this.addGenresToSelect();

			var form = document.getElementById('calculator');
			form.addEventListener('submit', this.onSubmit.bind(this));
			this.selectInput.addEventListener('change', this.onGenreChange.bind(this));

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

		onGenreChange: function(e) {

			var val = e.target.value;

			this.selectedGenre = val;

			this.updateGenreTextElem();
		},

		addGenreListeners: function() {
			var prev = document.getElementById('prev_genre');
			var next = document.getElementById('next_genre');

			prev.addEventListener('click', this.prevGenre.bind(this));
			next.addEventListener('click', this.nextGenre.bind(this));
		},

		addGenresToSelect: function() {

			var self = this;

			var i = 0;
			this.genres.forEach(function() {

				var option = document.createElement('option');

				option.value = i;
				option.innerHTML = self.genres[i];

				self.selectInput.appendChild(option);

				i++;
			});
		},

		handleCookieUsername: function(username) {

			this.entry.value = username;
		},

		prevGenre: function() {

			if (this.selectedGenre > 0)
				this.selectedGenre -= 1;
			else
				this.selectedGenre = this.genres.length-1;

			this.updateSelectInput();
			this.updateGenreTextElem('prev');
		},

		nextGenre: function() {

			if (this.selectedGenre < this.genres.length-1)
				this.selectedGenre += 1;
			else
				this.selectedGenre = 0;

			this.updateSelectInput();
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

		updateSelectInput: function() {

			var selected = this.selectInput.children[this.selectedGenre + 1];

			this.selectInput.value = this.selectedGenre;
			selected.setAttribute('selected', 'true');
		},

		destroy: function() {

		}
	}
});