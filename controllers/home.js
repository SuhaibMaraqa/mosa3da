const User = require('../models/User')
const Reports = require('../models/Reports')
const GroupTherapy = require('../models/GroupTherapy')

const ITEMS_PER_PAGE = 9;

// Get Index
exports.getIndex = (req, res, next) => {
    res.render('home', {
        pageName: 'home',
        path: '/',
        pageTitle: 'Mosa3da',
    })
}

// Get Dashboard
exports.getDashboard = (req, res, next) => {
    User.findOne({email : req.user.email})
        .then(user => {
            if(user.role !=='admin') {
            res.render('dashboard', {
                user: user,
                sessions: user.bookings,
                pageTitle: 'Dashboard', 
                path: '/dashboard',
                pageName: 'dashboard'
            });
        } else {
            res.redirect('/applications')
        }
        })
        .catch(err => {
            console.log('didnt find user account!')
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
}

// Get Therapists List
exports.getTherapists = (req, res, next) => {
    const page = +req.query.page || 1
    let totalTherapists

    User.find().countDocuments()
        .then(numTherapists => {
            totalTherapists = numTherapists
            return User.find()
                // .skip((page-1) * ITEMS_PER_PAGE)
                // .limit(ITEMS_PER_PAGE)
        })
        .then(users => {
            res.render('therapist-List', {
                user: req.user,
                pageName:'therapist list',
                usersAll: users,
                pageTitle: 'Therapist List',
                path:'/dashboard',
                // currentPage: page,
                // hasNextPage: ITEMS_PER_PAGE * page < totalTherapists,
                // hasPreviousPage: page > 1,
                // nextPage: page + 1,
                // previousPage: page - 1,
                // lastPage: Math.ceil(totalTherapists / ITEMS_PER_PAGE)
            })
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

// Get Patients
exports.getPatients = (req, res, next) => {
    User.findOne({email : req.user.email})
        .then(user => {
            if(user.role === 'therapist') {
                res.render('patients', {
                    user: user,
                    patients: user.patients,
                    pageTitle: 'Patients', 
                    path: '/patients',
                    pageName: 'patients',
                });
            } else {
                res.redirect('/dashboard')
            }
        })
        .catch(err => {
            console.log('didnt find user account!')
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
}

// Get User
exports.getUser = (req, res, next) => {
    const patientId = req.params.userId;
    User.findById(patientId)
            .then(user => {
                if(req.user.role === 'therapist') {
                res.render('patientAccount', {
                    patient: user,
                    user: req.user,
                    notes: req.user.notes.patientNotes,
                    pageTitle: user.name, 
                    path: '/user',
                    pageName: 'user account'
            })
            } else {
                res.redirect('/dashboard')
            }
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

// Add Note
exports.addNote = (req, res, next) => {
    const note = req.body;
    const userId = req.params.userId;

    User.findOne({ email: req.user.email })
      .then((user) => {
        if(req.user.role === 'therapist') {
            req.user.addNote(note, userId, user);
            setTimeout(() => {
                
                res.redirect('/users/' + userId)
              }, 200)
        } else {
            res.redirect('/dashboard')
        }
      })
      .catch((err) => {
        console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
      });
  }

// Get Therapist Account
exports.getTherapist = (req, res, next) => {
    const therapistId = req.params.therapistId;
    User.findById(therapistId)
            .then(therapist => {
                res.render('therapistAccount', {
                    therapist: therapist,
                    availableDates: therapist.availableDates,
                    user: req.user,
                    pageTitle: therapist.name, 
                    path: '/therapists',
                    pageName: 'therapist list'
            })
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

// Get List of Chats
exports.getMessages = (req, res, next) => {
    res.render('messages', {
        pageTitle: "Messages", 
        path: '/messages',
        pageName: 'messages',
        user: req.user,
        therapistCount: req.user.therapists.therapist.length,
})
}

// Get Chatting Screen
exports.getChat = (req, res, next) => {
    
    roomId = req.params.chatId
    if(roomId.includes(req.user._id)) {
        res.render('chat', {
            pageTitle: "Chat", 
            path: '/messages',
            pageName: 'messages',
            user: req.user
        })
    } else {
        res.redirect('/')
    }
}

// Get Video Call Screen
exports.getVideo = (req, res, next) => {

    roomId = req.params.roomId
    if(roomId.includes(req.user._id)) {
        res.render('room', {
            pageTitle: "Video Call", 
            path: '/video',
            pageName: 'video',
            user: req.user,
            roomId: roomId
        })
    } else {
        res.redirect('/')
    }
}

// Get Group Therapy
exports.getGroupTherapy = (req, res, next) => {
    let totalGroupss

    GroupTherapy.find().countDocuments()
        .then(totalGroups => {
            totalGroupss = totalGroups
            return GroupTherapy.find()
        })
        .then(groups => {
            res.render('group-therapy', {
                user: req.user,
                pageTitle: 'Group Therapy', 
                path: '/group-therapy',
                pageName: 'group therapy',
                groups: groups
            });
        })
        .catch(err => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
    
}

// Get Group Therapy Video Call
exports.getGroupTherapyVideo = (req, res, next) => {
    roomId = 'group-therapy'
    res.render('room', {
        pageTitle: "Video Call", 
        path: '/group-video',
        pageName: 'video',
        user: req.user,
        roomId: roomId
    })
}

// Get Personal Account
exports.getAccount = (req,res,next) => {

    User.findOne({email : req.user.email})
        .then(user => {
            res.render('user-profile', {
                user: user, 
                pageTitle: 'Account', 
                path: '/account',
                pageName: 'account'
            });
        })
        .catch(err => {
            console.log('didnt find user account!')
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
}

// Get Report a Problem Page
exports.getReport = (req, res, next) => {
    res.render('report', {
        pageName: 'report',
        path: '/report',
        pageTitle: 'Report',
        user: req.user
    })
}

// Post a Report
exports.postReport = (req, res, next) => {
    const { title, email, description } = req.body;
    let errors = [];

    //Check Required Fields
    if (!title ||!email || !description) {
        errors.push({ msg: "Can't leave the fields empty" });
    }

    if(errors.length > 0) {
        res.render("report", {
            errors,
            title,
            email,
            description,
            pageTitle: "Report",
            pageName: "report",
            user: req.user
          });
    } else {
        const newReport = new Reports({
            title,
            email,
            description
          });

          newReport
              .save()
              .then((report) => {
                req.flash("success_msg", "Report Sent Successfully");
                console.log("Report Sent!");
                res.redirect('/account')
              })
              .catch((err) => {
                console.log(err);
              });
    }
}