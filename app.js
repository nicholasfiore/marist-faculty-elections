// Import required Node modules
const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

// Session data and cookie setup for users
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

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

// Admin view page with middleware to check if user is admin
app.get('/admin_view', ensureAdmin, (req, res) => {
    res.render('admin_view');
});

app.listen(3000, () => {
    console.log('App Listening to port 3000');
});
