const express = require('express');
const mongoose = require('mongoose');
const Note = require('./models/Note');
const md = require('marked');
const app = express();

mongoose.connect("mongodb://localhost:27017/notes", {useNewUrlParser: true, useUnifiedTopology: true})

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', async (req, res) => {
    const notes = await Note.find()
    res.render('index', {notes})
});

app.get('/notes/new', (req, res) => {
    res.render('new')
})

app.get("/notes/:id", async (req, res) => {
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

app.listen(3000, ()=> console.log("listenig on port 3000"));