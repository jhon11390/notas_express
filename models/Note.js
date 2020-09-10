const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    body: String
})

const Note = mongoose.model("Note", NoteSchema)

module.exports = Note;