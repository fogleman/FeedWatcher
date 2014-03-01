require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),
    shim: {
        bootstrap: {
            deps: [
                'jquery'
            ]
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        }
    },
    paths: {
        backbone: '../bower_components/backbone/backbone',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
        jquery: '../bower_components/jquery/dist/jquery',
        moment: '../bower_components/momentjs/moment',
        text: '../bower_components/requirejs-text/text',
        underscore: '../bower_components/underscore/underscore',
    }
});

require(['backbone', 'app'], function (Backbone, App) {
    new App.Router();
    Backbone.history.start();
});
