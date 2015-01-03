/*
 The MIT License (MIT)

Copyright (c) 2014 Guilherme Nemeth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/******************************************************************************/

/**
 * The constructor of the router
 *
 * @class Router
 * @constructor
 */
var Router = function(options) {

	this.routes = [];
	this.active = {};
	this._domain = "";
	this.events = {};
	this.options = options || {pushState: true};
	this.baseRoute = "";

	// this is to make sure we only call valid events
	this._eventList = [
		'init',
		'load',
		'unload',
		'change'
	];

	this.init();
}

/**
 * Initialize the router class and start listening to the events
 *
 * @method init
 */
Router.prototype.init = function(initRoute) {

	var self = this;

	var tempDomain = [],
		tDomain = window.location.href.split('/');

	for (var i = 0; i < tDomain.length; i++) {
		if (i <= 2) {
			tempDomain.push(tDomain[i]);
		}
	}

	self._domain = tempDomain.join('/');

	self._registerWindowListeners();
	self._registerAnchorListeners();

	if (self.options.initRoute)
		this.redirect(self.options.initRoute);
}

/**
 * Registers our window events listeners
 *
 * @method _registerWindowListeners
 */
Router.prototype._registerWindowListeners = function() {

	var self = this;

	window.addEventListener('load', function(e) {

		self.baseRoute = window.location.href;
		self.dispatch(self.baseRoute, true);
	});

	window.addEventListener('beforeunload', function(e) {

		e.preventDefault();
		window.location.href = self.baseRoute;
		console.log("beforeunload");	
	});
}

/**
 * Register our events listeners of the anchors with the "route" class
 *
 * @method _registerAnchorListeners
 */
Router.prototype._registerAnchorListeners = function() {

	var self = this,
		anchors = document.getElementsByClassName('route');

	for (var i = 0; i < anchors.length; i++) {
		var a = anchors[i];

		a.addEventListener('click', function(e) {

			e.preventDefault();

			if (self.options.pushState) {
				history.pushState(null, document.title, window.location.href);
				history.replaceState(null, (this.title || document.title), this.href);
			}

			self.dispatch(this.href);
		});
	}
}

/**
 * Registers a new route
 *
 * Examples:
 *
 * var myRouter = new Router();
 * myRouter.on('/about', function() {});
 * myRouter.on('/user/<id>', ['id'], function() {});
 *
 * @method on
 * @param {string} the route to register
 * @param {array} the desired name of the parameters in the route
 * @param {function} the callback response for the route
 */
Router.prototype.on = function(route, params, cb) {

	var mParams = params;
	if (typeof(params) == 'function') {
		cb = params;
		mParams = [];
	}

	this.routes.push({
		route: route,
		params: mParams,
		response: cb
	});
}

/**
 * Redirect the application to a given route
 *
 * @method redirect
 * @param {string} the route to redirect
 */
Router.prototype.redirect = function(route) {

	var r = (this._domain + route);

	if (this.options.pushState) {
		history.pushState(null, document.title, window.location.href);
		history.replaceState(null, document.title, r);
	}

	this.dispatch(r, true);
}

/**
 * Register an event listener to the router
 *
 * @method onEvent
 * @param {string} the event to listen for
 * @param {function} the callback of this event
 */
Router.prototype.onEvent = function(e, cb) {

	var isValidEvent = false;

	this._eventList.forEach(function(evnt) {

		if (evnt == e) {
			isValidEvent = true;
		}
	});

	if (isValidEvent) {

		this.events[e] = cb;

		if (e == 'init' && this.events.init)
			this.events.init();
	}
}

/**
 * Dispatch the route if it's registered in the application
 *
 * @method dispatch
 * @param {string} the received route
 * @param {boolean} if it should call our events callbacks or not
 */ 
Router.prototype.dispatch = function(route, skipEvents) {

	var mRoute = this._treatRoute(route);

	var self = this;
	this.routes.forEach(function(registered) {

		var request = {};

		if (mRoute == registered.route) {

			request = {
				route: mRoute,
				params: {}
			};

		} else {

			var spl = mRoute.split('/');
			var r = registered.route.split('/');
			var thisRoute = false;

			for (var i = 1; i < spl.length; i++) {
				var a = spl[i], b = r[i];

				if (a == b) {
					thisRoute = true;
					break;
				}
			}

			if (thisRoute) {
				var params = self._getParams(mRoute, registered.route, registered.params);

				if (params.notEmpty) {

					params.notEmpty = null;

					request = {
						route: mRoute,
						params: params
					}
				}
			}
		}

		if (request.route && thisRoute) {

			self._finalContact(registered, request, skipEvents);
		}
	});
}

/**
 * This is our final contact with the request, take care dear route...
 *
 * @method _finalContact
 * @param {object} the route being requested
 * @param {object} the request itself
 * @param {string} the route string that events callbacks receive
 * @param {boolean} should we skip events or call them?
 */
Router.prototype._finalContact = function(route, request, skipEvents) {
	
	var cancel = false;

	if (!skipEvents) {
		cancel = this._checkEvents(request.route);
	}

	if (!cancel) {
		this.active = request.route;
		route.response(request.params);
	}
}

/**
 * Check if we have any event callback registered, and if so, call them
 *
 * @method _checkEvents
 * @param {string} the route that some callbacks need
 */
Router.prototype._checkEvents = function(route) {

	var cancel = false;

	if (this.events.load) 
		cancel = this.events.load(route);

	if (this.events.unload)
		cancel = this.events.unload(self.active);

	if (this.events.change)
		cancel = this.events.change(self.active, route);

	return cancel;
}

/**
 * Get only the interesting part of the route, not the whole url with domain and everything
 *
 * @method _treatRoute
 * @param {string} the route to treat
 */
Router.prototype._treatRoute = function(route) {

	var mRoute = route.split('/');
	var treated = [];

	mRoute.forEach(function(part) {

		if (treated.length) {
			treated.push(part)
		}

		if (part == mRoute[3]) {
			treated.push(part);
		}
	});

	var uri = '/'+ treated.join('/');	
	return uri;
}

/**
 * Get the params for the given route
 *
 * @method _checkParams
 * @param {string} the route received
 * @param {string} the registered route
 * @param {array} the registered route params
 */
Router.prototype._getParams = function(originalRoute, route, params) {

	var spl = originalRoute.split('/');
	var r = route.split('/');
	var j = 0;
	var obj = {};
	var thisRoute = false;

	for (var i = 0; i < spl.length; i++) {
		var a = spl[i], b = r[i];

		if (a != b) {

			var key = params[j];
			if (key) {

				if (b.indexOf('int:') > -1)
					obj[key] = parseInt(a);
				else
					obj[key] = a;

				j++;
				obj.notEmpty = true;
			}

		}
	}

	return obj;
}