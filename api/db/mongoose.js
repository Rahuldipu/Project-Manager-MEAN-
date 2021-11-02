const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/ProjectManager', { useNewUrlParser: true}).then(() => {
    console.log('connected to mongoDB successfully');
}).catch((e) => {
    console.log('Error while attempting to connectmongodb');
    console.log(e);
});

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', true);

module.exports = {
    mongoose
};