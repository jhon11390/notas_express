const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const Note = require('./models/Note');
const User = require('./models/User')
const md = require('marked');
const app = express();

mongoose.connect("mongodb://localhost:27017/notes", {useNewUrlParser: true, useUnifiedTopology: true})

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieSession({
    secret: "Una cadena secreta"
}))

const requireUser = (req, res, next) => {
    if(!res.locals.user){
        return res.redirect("/login")
    }
    next();
}

app.use(async (req, res, next) => {
    const userId = req.session.userId;
    if(userId){
        const user = await User.findById(userId);
        if(user){
            res.locals.user = user
        }else{
            delete req.session.userId;
        }
    }
    next();
})
app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', requireUser, async (req, res) => {
    const notes = await Note.find()
    res.render('index', {notes})
});

app.get('/notes/new', (req, res) => {
    res.render('new')
})

app.get("/notes/:id", requireUser, async (req, res) => {
    const note = await Note.findById(req.params.id);
    res.render('show', {currentNote: note, md: md});
})

app.get("/notes/:id/edit", async (req, res, next) => {
    try{
        const note = await Note.findById(req.params.id);
        res.render('edit', {currentNote: note})
    }catch(e){
        return next(e);
    }
})

app.post("/notes", async (req, res, next) => {
    const data = {
        title: req.body.title,
        body: req.body.body
    };
    try {
        const note = new Note(data);
        await note.save()
    }catch(e){
        return next(e)
    }
    res.redirect("/")
})

app.delete("/notes/:id", async (req, res, next) => {
    try{
        await Note.deleteOne({_id: req.params.id});
        res.status(204).send({});
    }catch(e){
        return next(e)
    }
})

app.patch("/notes/:id", async (req, res, next) => {
    const id = req.params.id;
    const note =  await Note.findById(id);
    note.title = req.body.title;
    note.body = req.body.body;
    try{
        await note.save({});
        res.status(204).send({});
    }catch(e){
        return next(e);
    }
})

//Rutas de login

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register",  async (req, res, next) => {
    try{
        const user = await User.create({
            email: req.body.email,
            password: req.body.password
        });
        res.redirect("/login")
    }catch(err){
        next(err)
    }
});

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/login", async (req, res, next) => {
    try{
        const user = await User.authenticate(req.body.email, req.body.password);
        if(user){
            req.session.userId = user._id;
            return res.redirect("/");
        }else{
            res.render("/login", {error: "mal password"});
        }
    }catch(err){
        return next(err)
    }
})

app.get("/logout", (req, res) => {
    req.session = null
    res.clearCookie("session");
    res.clearCookie("session.sig");
    res.redirect("/login");
})

app.listen(3000, ()=> console.log("listenig on port 3000"));