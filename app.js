// Import required Node modules
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const CASAuthentication = require('express-cas-authentication');
const https = require('https');
const fs = require('node:fs');
const util = require('util');

const app = express();

// Session data and cookie setup for users
app.use(session({
    secret: 'secret key',
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())
app.set('view engine', 'ejs');

var cas = new CASAuthentication({
    cas_url: 'https://auth.it.marist.edu/idp/profile/cas',
    service_url: 'http://fac-voting.ecrl.marist.edu',
    cas_version: "2.0",
    renew: false,

    session_name: 'cas_user',
    session_info: 'attributes',

    is_dev_mode: true,
    dev_mode_user: '12345678@marist.edu',
    dev_mode_info: { 
        displayname: "John P Smith",
        maristmailpref: "John.Smith@marist.edu",
        cn: "Nicholas A Fiore",
        employeetype: "FACULTY",
        udc_identifier: "12345678@marist.edu",
        maristcwid: "12345678"
    }
});

// Middleware to ensure user authentication
const ensureAuthenticated = (req, res, next) => {
    if (req.session.isUserAuthenticated) {
        return next();
    }
    res.redirect('/'); // redirect to landing if not authenticated
};

// Middleware to ensure admin authentication
const ensureAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin_login'); // redirect to admin login if not authenticated as admin
};

// Landing/Homepage
app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/authenticate', cas.bounce, (req, res) => {
    //Initialize cookie for user
    req.session.isUserAuthenticated = true;
    res.redirect('profile_view');
});

app.get('/logout', cas.logout);

//junk code
// app.get('/authenticate', (req, res) => {
//     req.session.isUserAuthenticated = true;
//     req.session.user = cas.cas_user;
//     res.redirect('profile_view');
// });


// Profile view GET handler
app.get('/profile_view', ensureAuthenticated, (req, res) => {
    res.render('profile_view');
});

// Profile view POST handler
app.post('/profile_view', (req, res) => {
    req.session.isUserAuthenticated = true; 
    res.render('profile_view');
});

// Name and Picture
app.get('/name_and_picture', ensureAuthenticated, (req, res) => {
    res.render('name_and_picture');
});

// Statement
app.get('/statement', ensureAuthenticated, (req, res) => {
    res.render('statement');
});

// Committees
app.get('/committees', ensureAuthenticated, (req, res) => {
    res.render('committees');
});

// Admin login page
app.get('/admin_login', (req, res) => {
    res.render('admin_login');
});

// Admin login POST handler
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";  // PLEASE change this to something more secure, even for testing

app.post('/admin_authenticate', (req, res) => {
    const { username, password } = req.body; 

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin_view');
    } else {
        res.send('Incorrect username or password');
    }
});

// Admin view page (profile search) with middleware to check if user is admin
app.get('/admin_view', ensureAdmin, (req, res) => {
    res.render('admin_view');
});

// Admin View and Manage
app.get('/view_and_manage', (req, res) => {
    res.render('view_and_manage');
});

// Admin Query Preview
app.get('/query_preview', (req, res) => {
    res.render('query_preview');
});

const options = {
    key: fs.readFileSync('/etc/ssl/private/pkey_facvoting.key'),
    cert: fs.readFileSync('/etc/ssl/certs/fac-voting_ecrl_marist_edu_cert.cer')
}

https.createServer(options, app).listen(3000, () => {
    console.log("Starting HTTPS server on port 3000");
});


//port app is listening on
// app.listen(3000, () => {
//     console.log('App Listening to port 3000');
// });
