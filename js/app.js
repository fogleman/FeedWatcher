define(function(require) {
    var Backbone = require('backbone');
    var moment = require('moment');
    require('jqueryui');

    var FEED_SERVER = 'http://127.0.0.1:5000/';

    var template = function(text) {
        var settings = {
            evaluate    : /\{\%([\s\S]+?)\%\}/g,
            interpolate : /\{\{([\s\S]+?)\}\}/g,
            escape      : /\{\-([\s\S]+?)\-\}/g
        };
        return _.template(text, undefined, settings);
    };

    var FeedForm = Backbone.View.extend({
        el: '#feed-form',
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
            this.interval = 60000;
            this.timestamp = 0;
            this.etag = null;
            this.modified = null;
        }
    });

    var Feeds = Backbone.Collection.extend({
        model: Feed
    });

    var FeedsView = Backbone.View.extend({
        el: '#feeds',
        events: {
            'click button': 'onUnwatch'
        },
        template: template(require('text!templates/feeds.html')),
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

    var ItemsView = Backbone.View.extend({
        el: '#items',
        template: template(require('text!templates/items.html')),
        initialize: function() {
            this.memo = {};
        },
        addItems: function(feed, items) {
            var changed = false;
            items.each(function(item) {
                if (item.id in this.memo) {
                    return;
                }
                changed = true;
                this.memo[item.id] = true;
                this.$el.prepend(this.template({
                    feed_title: feed.get('title'),
                    feed_link: feed.get('link'),
                    title: item.get('title'),
                    link: item.get('link'),
                    author: item.get('author'),
                    timestamp: item.get('timestamp')
                }));
                var row = this.$('tr').first();
                row.css({backgroundColor: '#fff3a5'});
                row.animate({backgroundColor: '#ffffff'}, 1000);
                row.click(function() {
                    window.open(item.get('link'), '_blank');
                    $(this).addClass('read');
                });
            }, this);
            if (changed) {
                updateTimestamps();
            }
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
                feed.set(data.feed);
                var items = new Items(data.entries);
                itemList.addItems(feed, items);
            });
        });
    };

    var watch = function(feeds, itemList) {
        function func() {
            updateTimestamps();
            poll(feeds, itemList);
            setTimeout(func, 5000);
        }
        feeds.on('add', func);
        func();
    };

    var updateTimestamps = function() {
        $('.timestamp').each(function() {
            var timestamp = $(this).attr('data-timestamp');
            var html = moment.utc(timestamp).fromNow();
            $(this).html(html);
        });
    };

    var Router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },
        index: function() {
            var feeds = new Feeds();
            var itemList = new ItemsView();
            new FeedForm({feeds: feeds});
            new FeedsView({feeds: feeds});
            watch(feeds, itemList);
            feeds.add({url: 'http://stackoverflow.com/feeds/tag?tagnames=python&sort=newest'});
            // feeds.add({url: 'http://www.npr.org/rss/rss.php?id=1001'})
        }
    });

    var App = {
        Router: Router
    };

    return App;
});
