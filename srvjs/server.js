const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { tag: 'xsuaa' }
    ,
    hana: { tag: 'hana' }
});

const hdbext = require('@sap/hdbext');
    
// placed before authentication - business user info from the JWT will not be set as HANA session variables (XS_)
app.use(hdbext.middleware(services.hana));

const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());
app.use(passport.authenticate('JWT', {
    session: false
}));


app.use(bodyParser.json());

// app home
app.get('/srvjs', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Viewer')) {
        res.status(200).send('arc');
    } else {
        res.status(403).send('Forbidden');
    }
});

// app user info
app.get('/srvjs/info', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Viewer')) {
        let info = {
            'userInfo': req.user,
            'subdomain': req.authInfo.getSubdomain()
        };
        res.status(200).json(info);
    } else {
        res.status(403).send('Forbidden');
    }
});


// app database
app.get('/srvjs/database', async function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Viewer')) {
        let sql = 'SELECT * FROM "CATALOGSERVICE_SALES"';
        req.db.exec(sql, function (err, results) {
            if (err) {
                res.type('text/plain').status(500).send('ERROR: ' + err.toString());
                return;
            }
            res.status(200).json(results);
        });
    } else {
        res.status(403).send('Forbidden');
    }
});

const port = process.env.PORT || 5002;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});