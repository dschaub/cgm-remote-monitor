function configure (app, wares, ctx, env) {
    var entries = ctx.entries;
    var express = require('express')
        , api = express.Router( );
    var translate = ctx.language.translate;

    // invoke common middleware
    api.use(wares.sendJSONStatus);
    // text body types get handled as raw buffer stream
    api.use(wares.bodyParser.raw());
    // json body types get handled as parsed json
    api.use(wares.bodyParser.json());

    api.post('/google', ctx.authorization.isPermitted('api:*:read'), function(req, res, next) {
        entries.list({
            count: 1
        }, function(err, records) {
            function trend() {
                switch (records.direction) {
                    case 'SingleUp':
                        return 'rising';
                    default:
                        return 'steady';
                }
            }

            if (records.sgv) {
                res.json({
                    fulfillmentText: 'Blood sugar is ' + records.sgv + ' and ' + trend()
                });
            } else {
                res.json({
                    fulfillmentText: 'Sorry, no recent blood sugar measurement is available.'
                });
            }

            return next();
        });
    });

    return api;
}

module.exports = configure;
