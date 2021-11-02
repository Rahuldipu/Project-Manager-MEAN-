const express = require('express');
const app = express();
var cors = require('cors');
const jwt = require('jsonwebtoken');


const { mongoose } = require('./db/mongoose');

const { List, Project, User } = require('./db/models');

// MIDDLEWARE

//load middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    exposedHeaders: ['x-access-token', 'x-refresh-token'],
}));

let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }


        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

// END MIDDLEWARE

// Route handler

// list routes

// GET /lists
// Purpose: get all lists
app.get('/lists', authenticate, (req, res) => {
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
})

// POST /lists
// Purpose: post list
app.post('/lists', authenticate, (req, res) => {
    let title = req.body.title;

    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        res.send(listDoc);
    });
})

// PATCH /lists/:id
// Purpose: Update list
app.patch('/lists/:id', authenticate, (req, res) => {
    List.findOneAndUpdate({_id: req.params.id, _userId: req.user_id}, {
        $set: req.body
    }).then(() => {
        res.send({'message': 'Updated successfully'});
    })
})

// DELETE /lists/:id
// Purpose: delete list
app.delete('/lists/:id', authenticate, (req, res) => {
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        //delete all the project related to that deleted list
        deleteProjectsFromList(removedListDoc._id);
    })
})

// GET /lists/:listId/projects
// Purpose: get all projects
app.get('/lists/:listId/projects', authenticate, (req, res) => {
    Project.find({
        _listId : req.params.listId
    }).then((projects) => {
        res.send(projects);
    })
})

app.get('/lists/:listId/projects/:projectId', (req, res) => {
    Project.findOne({
        _id: req.params.projectId,
        _listId: req.params.listId
    }).then((project) => {
        res.send(project);
    })
})

// POST /lists/:listId/projects
// Purpose: create project
app.post('/lists/:listId/projects', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list){
            //therefore the current authenticated user can create new project
            return true;
        }
        return false;
    }).then((canCreateProject) => {
        if(canCreateProject) {
            let newProject = new Project({
                title: req.body.title,
                _listId: req.params.listId,
                description: req.body.description
            });
            newProject.save().then((newProjectDoc) => {
                res.send(newProjectDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
})

// PATCH /lists/:listId/projects/:projectId
// Purpose: update project
app.patch('/lists/:listId/projects/:projectId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list){
            //therefore the current authenticated user can update new project
            return true;
        }
        return false;
    }).then((canUpdateProjects) => {
        if(canUpdateProjects) {
            Project.findOneAndUpdate({
                _id: req.params.projectId,
                _listId: req.params.listId
            }, {
                $set: req.body
            }).then(() => {
                res.send({message: "updated successfully"});
            })
        } else {
            res.sendStatus(404);
        }
    })
})


// DELETE /lists/:listId/projects/:projectId
// Purpose: delete project
app.delete('/lists/:listId/projects/:projectId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list){
            //therefore the current authenticated user can update new project
            return true;
        }
        return false;
    }).then((canDeleteProjects) => {
        if(canDeleteProjects) {
            Project.findOneAndRemove({
                _id: req.params.projectId,
                _listId: req.params.listId
            }).then((removedProjectDoc) => {
                res.send(removedProjectDoc);
            })
        }else {
            res.sendStatus(404);
        }
    })
})


// User Routes 

// POST /users
// Purpose: Signup
app.post('/users', (req, res) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return {accessToken, refreshToken}
        })
    }).then((authToken) => {
        res
            .header('x-refresh-token', authToken.refreshToken)
            .header('x-access-token', authToken.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

// POST /users/login
// Purpose: Login
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            return user.generateAccessAuthToken().then((accessToken) => {
                return {accessToken, refreshToken}
            })
        }).then((authToken) => {
            res
            .header('x-refresh-token', authToken.refreshToken)
            .header('x-access-token', authToken.accessToken)
            .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})


//  GET /users/me/access-token
//  Purpose: generates and returns an access token
app.get('/users/me/access-token', verifySession, (req, res) => {
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

/* HELPER METHODS */
let deleteProjectssFromList = (_listId) => {
    Project.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + " were deleted!");
    })
}

app.listen(3000,() => {
    console.log("Server is listening at 3000");
})