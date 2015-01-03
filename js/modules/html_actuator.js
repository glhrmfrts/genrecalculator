/**
 * This module insert the result of the calculator in the html
 */

Core.register('html_actuator', function(sandbox) {

	return {

		init: function() {

			this.titles = [
				'Only <percentage>%, I hope you hate <genre>',
				'We regret to inform, but you are only <percentage>% <genre>',
				'Well, it seems you are <percentage>% <genre>',
				'Cool, you are <percentage>% <genre>',
				'Great news (or bad), you are <percentage>% <genre>'
			];
			this.selfTitles = [
				'I\'m <percentage>% <genre>'
			];
			this.html = {
				container: document.getElementById('result'),
				title: document.createElement('h2'),
				artistsTitle: document.createElement('h3'),
				artistsCompared: document.createElement('div'),
				artistsRecomendations: document.createElement('div'),
				artistsColumns: [],
				artistsRecomendColumns: [],
				tryAgain: '<a href="" class="try-again btn btn-default" title="Try again"><i class="repeat icon"></i></a>',
				discover: '<button class="artists-switch btn btn-default" id="artists-switch" title="Discover"><i class="plus icon"></i></button>',
				lastfm_icon: 'https://cdn0.iconfinder.com/data/icons/yooicons_set01_socialbookmarks/512/social_lastfm_box_red.png',
				share: ' <div class="share"><div class="ui facebook button"><i class="facebook icon"></i> Facebook</div><div class="ui twitter button"><i class="twitter icon"></i> Twitter</div></div>'
			};
			this.active = 0;
			this.available = true;

			//sandbox.listen('lastfm_username_entry', this.handleUsername.bind(this));
			sandbox.listen('emo_calculator_result', this.handleResult.bind(this));
		},

		handleUsername: function(data) {

			this.html.container.style.textAlign = "center";
			this.html.container.innerHTML = '<img src="/howemo/assets/img/720.gif">';
		},

		handleResult: function(data) {

			this.resultData = data;
			this.getResultTitle();
		},

		getResultTitle: function() {

			var title = "";
			var self = this;
	
			for (var i = 1; i < self.titles.length; i++) {

				var p = i / self.titles.length * 100;
				if (self.resultData.percentage < p && title == "") {
					title += this.titles[i-1];
				}
			}

			this.html.title.innerHTML = title.replace("<percentage>", this.resultData.percentage.toString());
			this.html.title.innerHTML = this.html.title.innerHTML.replace("<genre>", this.resultData.genre);
			this.html.title.innerHTML += this.html.share;
			this.setMetaTags();			
		},

		setMetaTags: function() {

			var self = this;
			var metas = document.getElementsByTagName('meta');

			var title = 'I\'m '+ self.resultData.percentage +'% '+ self.resultData.genre;

			for (var i = 0; i < metas.length; i++) {

				var meta = metas[i];
				if (meta.getAttribute('property') == 'og:title') {
					meta.content = title;
				} 
			}

			this.getHeader();
		},

		getHeader: function() {

			this.html.artistsTitle.id = "artists-heading";
			this.html.artistsTitle.innerHTML = '<span id="artists-title">Your top '+this.resultData.genre+' artists</span>';
			this.html.artistsTitle.innerHTML += this.html.tryAgain;
			this.html.artistsTitle.innerHTML += this.html.discover;

			this.html.artistsCompared.className = 'artists-compared';
			this.html.artistsCompared.id = 'artists-compared';
			this.html.artistsRecomendations.className = 'artists-recomendations';
			this.html.artistsRecomendations.id = 'artists-recomendations';

			if (this.resultData.matches == 0) {
				this.html.artistsTitle.innerHTML = '<span id="artists-title">Some '+this.resultData.genre+' artists recomendations</span>';
				this.html.artistsTitle.innerHTML += this.html.tryAgain;
				this.html.artistsTitle.innerHTML += this.html.discover;

				this.getRecomendations(true);
			} else {
				this.getArtistsCompared();
			}
		},

		getArtistsCompared: function() {
			
			var self = this;
			
			this.resultData.artistsMatches.forEach(function(artist) {

				var col = document.createElement('div');
				col.className = 'col-xs-12 col-sm-6 col-md-3';

				var inner = document.createElement('div');
				inner.className = 'artist-col';

				var thumb = new Image();
				thumb.src = artist.image[3]['#text'];
				thumb.className = 'img-thumbnail';
				inner.appendChild(thumb);

				var artistName = (artist.name.length > 24) ? (artist.name.substring(0, 21) + "...") : artist.name;
				var name = document.createElement('h5');
				name.innerText = artistName;
				inner.appendChild(name);

				var playCount = document.createElement('span');
				playCount.innerText = "Scrobbles: "+ artist.playcount;

				var lastfm = document.createElement('a');
				lastfm.href = artist.url;
				lastfm.title = "Open in last.fm";
				lastfm.target = "_blank";
				lastfm.innerHTML = '<img src='+ self.html.lastfm_icon +' class="lastfm_icon">';
				playCount.appendChild(lastfm);
				inner.appendChild(playCount);

				col.appendChild(inner);

				self.html.artistsColumns.push(col);
			});

			this.getRecomendations(false);
		},

		getRecomendations: function(go) {

			var self = this;

			this.resultData.recomendations.forEach(function(artist) {

				var col = document.createElement('div');
				col.className = 'col-xs-12 col-sm-6 col-md-3';

				var inner = document.createElement('div');
				inner.className = 'artist-col';

				var thumb = new Image();
				thumb.src = artist.image[3]['#text'];
				thumb.className = 'img-thumbnail';
				inner.appendChild(thumb);

				var artistName = (artist.name.length > 24) ? (artist.name.substring(0, 21) + "...") : artist.name;
				var name = document.createElement('h5');
				name.innerText = artistName;
				inner.appendChild(name);

				var lastfm = document.createElement('a');
				lastfm.href = artist.url;
				lastfm.title = "Open in last.fm";
				lastfm.target = "_blank";
				lastfm.innerHTML = '<img src='+ self.html.lastfm_icon +' class="lastfm_icon_recomend"> View in last.fm';
				inner.appendChild(lastfm);

				inner.appendChild(document.createElement('br'));

				var youtube = document.createElement('a');
				youtube.href = "https://www.youtube.com/results?search_query="+ artist.name;
				youtube.title = "Search on youtube";
				youtube.target = "_blank";
				youtube.innerHTML = '<i class="youtube square icon"></i>Search on youtube';
				inner.appendChild(youtube);

				col.appendChild(inner);

				self.html.artistsRecomendColumns.push(col);
			});

			this.appendHtml(go);
		},

		appendHtml: function(go) {

			var self = this;

			this.html.container.innerHTML = "";
			this.html.container.appendChild(this.html.title);
			this.html.container.appendChild(document.createElement('hr'));
			this.html.container.appendChild(this.html.artistsTitle);
			this.html.container.appendChild(document.createElement('br'));

			this.html.artistsColumns.forEach(function(col) {

				self.html.artistsCompared.appendChild(col);
			});

			this.html.artistsRecomendColumns.forEach(function(col) {

				self.html.artistsRecomendations.appendChild(col);
			})

			this.html.container.appendChild(this.html.artistsCompared);
			this.html.container.appendChild(this.html.artistsRecomendations);

			var header = document.getElementById('header');

			sandbox.x("Velocity")(header, {height: 0, opacity:0}, 500, "swing");
			window.setTimeout(function() {
				header.style.display = "none";
			}, 500);

			this.setRecomendButtonListener();
			if (go) {
				this.active = 1;
				this.html.artistsCompared.style.display = "none";
				this.html.artistsCompared.style.opacity = 0;
				this.html.artistsRecomendations.style.display = "block";
				this.html.artistsRecomendations.style.opacity = 1;
			}
		},

		setRecomendButtonListener: function() {

			var btn = document.getElementById('artists-switch');
			btn.addEventListener('click', this.switchArtists.bind(this));
		},

		switchArtists: function() {

			var self = this;
			var btn = document.getElementById('artists-switch');
			var artistsCompared = document.getElementById('artists-compared');
			var artistsRecomendations = document.getElementById('artists-recomendations');
			var title = document.getElementById('artists-title');

			if (!this.available)
				return;

			if (this.active == 0) {

				btn.innerHTML = '<i class="user icon"></i>';
				sandbox.x("Velocity")(artistsCompared, {opacity: 0}, 250);
				sandbox.x("Velocity")(title, {opacity: 0}, 250);
				this.available = false;
				window.setTimeout(function() {

					artistsCompared.style.display = "none";
					artistsRecomendations.style.display = "block";
					title.innerText = "Some "+ self.resultData.genre +" artists recomendations";

					sandbox.x("Velocity")(artistsRecomendations, {opacity: 1}, 250);
					sandbox.x("Velocity")(title, {opacity: 1}, 250);
					self.available = true;

				}, 200);
				this.active = 1;
			} else {

				btn.innerHTML = '<i class="plus icon"></i>';
				sandbox.x("Velocity")(artistsRecomendations, {opacity: 0}, 250);
				sandbox.x("Velocity")(title, {opacity: 0}, 250);
				this.available = false;
				window.setTimeout(function() {

					artistsCompared.style.display = "block";
					artistsRecomendations.style.display = "none";
					title.innerText = "Your top "+ self.resultData.genre +" artists";

					sandbox.x("Velocity")(artistsCompared, {opacity: 1}, 250);
					sandbox.x("Velocity")(title, {opacity: 1}, 250);
					self.available = true;

				}, 200);
				this.active = 0;
			}
		},

		destroy: function() {

		}
	}
});
