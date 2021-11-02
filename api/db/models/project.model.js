const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _listId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        trim: true
    }
})

const Project = mongoose.model('Project',  ProjectSchema);

module.exports = {
    Project
}