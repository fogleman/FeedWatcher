require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),
    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: [
                'jquery'
            ]
        },
        jqueryui: {
            deps: [
                'jquery'
            ]
        },
        underscore: {
            exports: '_'
        }
    },
    paths: {
        backbone: '../bower_components/backbone/backbone',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        jquery: '../bower_components/jquery/dist/jquery',
        jqueryui: '../bower_components/jqueryui/ui/jquery-ui',
        moment: '../bower_components/momentjs/moment',
        spinjs: '../bower_components/spinjs/spin',
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore/underscore',
    }
});

require(['backbone', 'app'], function(Backbone, App) {
    new App.Router();
    Backbone.history.start();
});
