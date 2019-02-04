var moment = require('moment');

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
            function trend(record) {
                switch (record.direction) {
                    case 'FortyFiveUp':
                        return 'rising';
                    case 'SingleUp':
                        return 'rising quickly';
                    case 'DoubleUp':
                        return 'rising very quickly';
                    case 'FortyFiveDown':
                        return 'falling';
                    case 'SingleDown':
                        return 'falling quickly';
                    case 'DoubleDown':
                        return 'falling very quickly';
                    default:
                        return 'steady';
                }
            }

            if (records.length && ((Date.now() - records[0].date) < 1800000)) {
                var agePhrase = moment(records[0].date).fromNow();

                res.json({
                    fulfillmentText: 'Blood sugar is ' + records[0].sgv + ' and ' + trend(records[0]) + ' as of ' + agePhrase
                });
            } else {
                res.json({
                    fulfillmentText: 'There have been no blood sugar readings in the last 20 minutes.'
                });
            }

            return next();
        });
    });

    return api;
}

module.exports = configure;

/**
 * example entry:
[
    {
        "_id": "5c57849f66290a396b2a0332",
        "sgv": 263,
        "date": 1549239314000,
        "dateString": "2019-02-04T00:15:14.000Z",
        "trend": 3,
        "direction": "FortyFiveUp",
        "device": "share2",
        "type": "sgv"
    }
]
*/
