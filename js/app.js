define(function(require) {
    var Backbone = require('backbone');

    var FEED_SERVER = 'http://127.0.0.1:5000/';

    var UrlForm = Backbone.View.extend({
        el: '#url-form',
        events: {
            'submit': 'onSubmit'
        },
        initialize: function(options) {
            this.feeds = options.feeds;
        },
        onSubmit: function(event) {
            event.preventDefault();
            var url = this.$('input').val();
            this.$('input').val('');
            this.feeds.add({url: url});
        }
    });

    var Feed = Backbone.Model.extend({
        initialize: function() {
            this.interval = 30000;
            this.timestamp = 0;
            this.etag = null;
            this.modified = null;
        }
    });

    var Feeds = Backbone.Collection.extend({
        model: Feed
    });

    var FeedList = Backbone.View.extend({
        el: '#feed-list',
        events: {
            'click button': 'onUnwatch'
        },
        template: _.template(require('text!templates/feed-list.html')),
        initialize: function(options) {
            this.feeds = options.feeds;
            this.listenTo(this.feeds, 'add', this.render);
            this.listenTo(this.feeds, 'remove', this.render);
        },
        render: function() {
            this.$el.empty();
            this.feeds.each(function(feed) {
                this.$el.append(this.template({
                    cid: feed.cid,
                    url: feed.get('url')
                }));
            }, this);
        },
        onUnwatch: function(event) {
            event.preventDefault();
            var model = this.feeds.get(event.target.id);
            this.feeds.remove(model);
        }
    });

    var Item = Backbone.Model.extend({
    });

    var Items = Backbone.Collection.extend({
        model: Item,
        comparator: function(item) {
            var date = new Date(item.get('timestamp'));
            return date.getTime();
        }
    });

    var ItemList = Backbone.View.extend({
        el: '#item-list',
        template: _.template(require('text!templates/item-list.html')),
        initialize: function() {
            this.memo = {};
        },
        addItems: function(items) {
            items.each(function(item) {
                if (item.id in this.memo) {
                    return;
                }
                this.memo[item.id] = true;
                this.$el.prepend(this.template(item.attributes));
            }, this);
        }
    });

    var poll = function(feeds, itemList) {
        var now = new Date().getTime();
        feeds.each(function(feed) {
            if (now - feed.timestamp < feed.interval) {
                return;
            }
            feed.timestamp = now;
            var url = feed.get('url');
            console.log(url);
            url = FEED_SERVER + '?callback=?&url=' + encodeURIComponent(url);
            if (feed.etag !== null) {
                url += '&etag=' + encodeURIComponent(feed.etag);
            }
            if (feed.modified !== null) {
                url += '&modified=' + encodeURIComponent(feed.modified);
            }
            $.getJSON(url, function(data) {
                feed.etag = data.etag;
                feed.modified = data.modified;
                var items = new Items(data.entries);
                itemList.addItems(items);
            });
        });
    };

    var watch = function(feeds, itemList) {
        function func() {
            poll(feeds, itemList);
            setTimeout(func, 5000);
        }
        feeds.on('add', func);
        func();
    };

    var Router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },
        index: function() {
            var feeds = new Feeds();
            var itemList = new ItemList();
            new UrlForm({feeds: feeds});
            new FeedList({feeds: feeds});
            watch(feeds, itemList);
        }
    });

    var App = {
        Router: Router
    };

    return App;
});
