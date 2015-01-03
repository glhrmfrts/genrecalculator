/**
 * This module save and read things from cookies
 */
Core.register('cookies_helper', function(sandbox) {

	return {

		init: function() {

			this.username = "";
			this.checkUsername();
			sandbox.listen('lastfm_username_entry', this.handleUsernameEntry.bind(this));
		},

		checkUsername: function() {

			var self = this;
			this.username = this.getCookie('username');

			if (this.username) {
				window.setTimeout(function() {
					sandbox.notify({
						type: 'read_cookie_username',
						data: self.username
					});
				}, 200);
			}
		},

		handleUsernameEntry: function(data) {

			if (this.username == "") {

				this.setCookie("username", data.username);
			}
		},

		getCookie: function(name) {
			var cookies = document.cookie.split(';');
			var wanted = "";

			cookies.forEach(function(c) {

				var obj = c.split('=');

				if (obj[0] == name) 
					wanted = obj[1];

			});

			return wanted;
		},

		setCookie: function(name, value) {

			document.cookie = name +'='+ value;
		},

		destroy: function() {

		}
	}
});