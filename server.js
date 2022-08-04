if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const cors = require('cors')
const LocalStrategy = require('passport-local')
const path = require('path')

const User = require('./models/user.js')
const Admin = require('./models/admin')
const userRoutes = require('./routes/user');
const patientRoutes = require('./routes/patient')
const doctorRoutes = require('./routes/doctor')
const ExpressError = require('./utils/ExpressError');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/onehealth'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to mongod')
    })
    .catch((err) => {
        console.log('Connection Error', err);
    })

const sessionConfig = {
    name: 'session',
    secret: 'numDB',
    resave: true,
    saveUninitialized: true,
}

app.use(express.static(path.resolve(__dirname, "./client/build")));

//app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(session(sessionConfig))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to OneHealth's API section!" })
})

app.get('*', (req, res) => {
    res.status(200).json({ message: "404 Not Found :(" })
})

app.use(function (err, req, res, next) {
    console.log(err);
    const { statusCode = 500 } = err
    if (!err.message) {
        err.message = 'Something went wrong'
    }
    res.status(statusCode).json(err)
});

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Hosted on port 8080')
})  