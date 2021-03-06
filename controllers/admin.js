const User = require("../models/User");
const Reports = require("../models/Reports");
const GroupTherapy = require("../models/GroupTherapy");
const fileSystem = require("fs");
const jwt = require("jsonwebtoken");
const {
  sendJoinUsApprovalEmail,
  sendJoinUsRejectionEmail
} = require("../emails/account");
const ITEMS_PER_PAGE = 9;


// Get Applications Page
exports.getApplications = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalApplications;

  User.find()
    .countDocuments()
    .then((numApplications) => {
      totalApplications = numApplications;
      return User.find({ role: "therapist", acceptedTherapist: "No" })
        // .skip((page - 1) * ITEMS_PER_PAGE)
        // .limit(ITEMS_PER_PAGE);
    })
    .then((users) => {
      res.render("applications", {
        user: req.user,
        pageName: "applications",
        usersAll: users,
        pageTitle: "Applications",
        path: "/applications",
        // currentPage: page,
        // hasNextPage: ITEMS_PER_PAGE * page < totalApplications,
        // hasPreviousPage: page > 1,
        // nextPage: page + 1,
        // previousPage: page - 1,
        // lastPage: Math.ceil(totalApplications / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// View CV
exports.getApplication = (req, res, next) => {
  const id = req.params.therapistId;

  User.findById(id).then((user) => {
    let filePath = user.cv.filePath;
    let stat = fileSystem.statSync(filePath);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Length": stat.size,
    });

    let readStream = fileSystem.createReadStream(filePath);

    readStream.pipe(res);
  });
};

// Accept Application
exports.postAcceptApplication = (req, res, next) => {
  const therapistEmail = req.body.userEmail;

  User.findOne({ email: therapistEmail })
    .then((therapist) => {
      therapist.acceptedTherapist = "Yes";
      return therapist.save().then((results) => {
        const secret = process.env.JWT_SECRET + therapist.password;
        const payload = {
          email: therapistEmail,
          id: therapist._id.toString(),
        };
        const token = jwt.sign(payload, secret, { expiresIn: "15m" });
        const link = `http://localhost:5000/reset-password/${therapist._id}/${token}`;
        console.log("Accepted Therapist");
        sendJoinUsApprovalEmail(therapist.email, therapist.name, link);
        res.redirect("/applications");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// Decline Application
exports.postDeclineApplication = (req, res, next) => {
  const therapistEmail = req.body.userEmail;

  User.findOne({ email: therapistEmail })
    .then((therapist) => {
      return User.deleteOne({ email: therapistEmail }).then((results) => {
        console.log("Declined Therapist");
        sendJoinUsRejectionEmail(therapist.email, therapist.name)
        res.redirect("/applications");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


// Get Add New Group Therapy Room Page
exports.getAddGroupTherapies = (req, res, next) => {
  res.render('edit-group-therapy', {
    user: req.user,
    pageTitle: 'Edit Group Therapy', 
    path: '/edit-group-therapy',
    pageName: 'group therapy',
});
};

// Add New Group Therapy Room
exports.postAddGroupTherapy = (req, res, next) => {
  const { roomName, therapist, duration, date, time } = req.body;
  let errors = [];

  //Check Required Fields
  if (!roomName || !therapist || !duration || !date || !time) {
    errors.push({ msg: "Please fill the required info" });
  }
  if (errors.length > 0) {
    res.render("edit-group-therapy", {
      roomName, therapist, duration, date, time, errors,
      pageTitle: "Add New Group Therapy",
      pageName: "group therapy",
      user: req.user
    });
  } else {
    var roomDateInNumber;
    if(date === 'Saturday') roomDateInNumber = 6
    if(date === 'Sunday') roomDateInNumber = 0
    if(date === 'Monday') roomDateInNumber = 1
    if(date === 'Tuesday') roomDateInNumber = 2
    if(date === 'Wednesday') roomDateInNumber = 3
    if(date === 'Thursday') roomDateInNumber = 4
    if(date === 'Friday') roomDateInNumber = 5
    const newGroupTherapy = new GroupTherapy({
      roomName: roomName,
      roomDate: date,
      roomDateInNumber: roomDateInNumber,
      roomDuration: duration,
      roomTherapist: therapist,
      roomTime: time
    })

    newGroupTherapy
        .save()
        .then(result => {
            console.log("Group Therapy Created.");
            res.redirect('/group-therapy')
        })
        .catch(err => {
          console.log('Group Therapy Failed', err);
        })
  }
}

// Delete Group Therapy Room
exports.postDeleteGroupTherapies = (req, res, next) => {

  const groupId = req.body.groupId

  GroupTherapy.deleteOne({_id: groupId})
                    .then(result => {
                        res.redirect('/group-therapy');
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                      });
  
};


// Get Reports Page
exports.getReports = (req, res, next) => {
  
  Reports.find()
          .then((reports) => {
            res.render("reports", {
              user: req.user,
              pageName: "reports",
              reports: reports,
              pageTitle: "Reports",
              path: "/reports",
          })
        })
          .catch((err) => {
            console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};

// Delete Report
exports.deleteReport = (req, res, next) => {
  const reportId = req.body.reportId;

  Reports.findOne({ _id: reportId })
    .then((report) => {
      return Reports.deleteOne({ _id: reportId }).then((results) => {
        console.log("Declined Therapist");
        res.redirect("/reports");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}


      