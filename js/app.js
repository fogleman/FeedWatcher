define(function(require) {
    var Backbone = require('backbone');

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
        model: Item
    });

    var ItemList = Backbone.View.extend({
        el: '#item-list',
        template: _.template(require('text!templates/item-list.html')),
        initialize: function(options) {
            this.items = options.items;
            this.listenTo(this.items, 'add', this.render);
            this.listenTo(this.items, 'remove', this.render);
        },
        render: function() {
            this.$el.empty();
            this.items.each(function(item) {
                this.$el.append(this.template(item.attributes));
            }, this);
        }
    });

    var watch = function(feeds, items) {
        function poll() {
            feeds.each(function(feed) {
                var url = feed.get('url');
                url = encodeURIComponent(url);
                url = 'http://127.0.0.1:5000/?callback=?&url=' + url;
                $.getJSON(url, function(data) {
                    _.each(data.entries, function(entry) {
                        items.add(entry);
                    });
                });
            });
            setTimeout(poll, 10000);
        }
        poll();
    };

    var Router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },
        index: function() {
            var feeds = new Feeds();
            var items = new Items();
            new UrlForm({feeds: feeds});
            new FeedList({feeds: feeds});
            new ItemList({items: items});
            watch(feeds, items);
        }
    });

    var App = {
        Router: Router
    };

    return App;
});
