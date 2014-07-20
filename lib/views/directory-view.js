var __hasProp = {}.hasOwnProperty,
	__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	$ = require('atom').$,
	FileView = require('./file-view'),
	View = require('atom').View;

module.exports = DirectoryView = (function (parent) {

	__extends(DirectoryView, parent);

	function DirectoryView () {
		DirectoryView.__super__.constructor.apply(this, arguments);
	}

	DirectoryView.content = function () {
		return this.li({
			'class': 'directory entry list-nested-item collapsed'
		}, function () {
			this.div({
				'class': 'header list-item',
				'outlet': 'header'
			}, function () {
				return this.span({
					'class': 'name icon',
					'outlet': 'name'
				})
			}.bind(this));
			this.ol({
				'class': 'entries list-tree',
				'outlet': 'entries'
			});
		}.bind(this));
	};

	DirectoryView.prototype.initialize = function (directory) {
		//DirectoryView.__super__.initialize.apply(this, arguments);

		var self = this;

		self.item = directory;
		self.name
			.addClass(self.item.type && self.item.type == 'l' ? 'icon-file-symlink-directory' : 'icon-file-directory')
			.text(self.item.name);

		if (self.item.isExpanded || self.item.isRoot)
			self.expand();

		// Trigger repaint
		self.item.$folders.onValue(function () { self.repaint(); });
		self.item.$files.onValue(function () { self.repaint(); });
		self.item.on('destroyed', function () { self.destroy(); });
		self.repaint();

		// Events
		self.on('mousedown', function (e) {
			e.stopPropagation();

			var view = $(this).view(),
				button = e.originalEvent ? e.originalEvent.button : 0;

			if (!view)
				return;

			switch (button) {
				case 2:
					if (view.is('.selected'))
						return;
				default:
					if (!e.ctrlKey)
						$('.remote-ftp-view .selected').removeClass('selected');
					view.toggleClass('selected');

					if (view.item.status == 0)
						view.open();

					if (button == 0)
						view.toggle();
					else
						view.expand();
			}
		});
		self.on('dblclick', function (e) {
			e.stopPropagation();

			var view = $(this).view();
			if (!view)
				return;

			view.open();
		});
	}

	DirectoryView.prototype.destroy = function () {
		this.item = null;

		this.remove();
	}

	DirectoryView.prototype.repaint = function (recursive) {
		var self = this,
			views = self.entries.children().map(function () { return $(this).view(); }).get(),
			folders = [],
			files = [];

		self.entries.children().detach();

		self.item.folders.forEach(function (item) {
			for (var a = 0, b = views.length; a < b; ++a)
				if (views[a] && views[a] instanceof DirectoryView && views[a].item == item) {
					folders.push(views[a]);
					return;
				}
			folders.push(new DirectoryView(item));
		});
		self.item.files.forEach(function (item) {
			for (var a = 0, b = views.length; a < b; ++a)
				if (views[a] && views[a] instanceof FileView && views[a].item == item) {
					files.push(views[a]);
					return;
				}
			files.push(new FileView(item));
		});

		// TODO Destroy left over...

		views = folders.concat(files);

		views.sort(function (a, b) {
			if (a.constructor != b.constructor)
				return a instanceof DirectoryView ? -1 : 1;
			if (a.item.name == b.item.name)
				return 0;
			return a.item.name > b.item.name ? 1 : -1;
		});

		views.forEach(function (view) {
			self.entries.append(view);
		});
	}

	DirectoryView.prototype.expand = function (recursive) {
		this.addClass('expanded').removeClass('collapsed');
		this.item.isExpanded = true;

		if (recursive) {
			this.entries.children().each(function () {
				var view = $(this).view();
				if (view && view instanceof DirectoryView)
					view.expand(true);
			});
		}
	}

	DirectoryView.prototype.collapse = function (recursive) {
		this.addClass('collapsed').removeClass('expanded');
		this.item.isExpanded = false;

		if (recursive) {
			this.entries.children().each(function () {
				var view = $(this).view();
				if (view && view instanceof DirectoryView)
					view.collapse(true);
			});
		}
	}

	DirectoryView.prototype.toggle = function (recursive) {
		if (this.item.isExpanded)
			this.collapse(recursive);
		else
			this.expand(recursive);
	}

	DirectoryView.prototype.open = function () {
		this.item.open();
	}

	DirectoryView.prototype.refresh = function () {
		this.item.open();
	}

	return DirectoryView;

})(View);