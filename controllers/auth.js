const User = require("../models/user");
const bcrypt = require("bcryptjs");
let nodemailer = require("nodemailer");
let sgTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");
// api key https://sendgrid.com/docs/Classroom/Send/api_keys.html
// username + password
var options = {
  auth: {
    api_key:
      "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",
  },
};

var mailer = nodemailer.createTransport(sgTransport(options));
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // const isloggedIn=req.session.isloggedIn;
  // const isloggedIn = req.get("Cookie").split(";")[2].trim().split("=")[1];
  res.render("auth/login", {
    path: "/Login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
    },
    validationError:[]
  });
};

exports.postLogin = (req, res, next) => {
  // const errors=validationResult(req);
  // if(!errors.isEmpty())
  // {
  //   return res.status(422).render("auth/login", {
  //     path: "/login",
  //     pageTitle: "login",
  //     errorMessage:errors.array()[0].msg

  //   });

  // }
  console.log("i am in login module");
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationError:errors.array()
    });
  }
  User.findOne({ email: email })
    .then((user) => {
  
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isloggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log("err");

              console.log(err);
              res.redirect("/");
            });
          }

          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "login",
            errorMessage: 'invalid password',
            oldInput: {
              email: email,
              password: password,
            },
            validationError:[{
              param: 'password',
              location: 'body'
            }]
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationError:errors.array()
    });
  }

  return bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");

      var email_send = {
        to: email,
        from: "frana7738@gmail.com",
        subject: "node Signup",
        text: "Awesome sauce",
        html: "<b>Awesome sauce</b>",
      };

      return mailer.sendMail(email_send, function (err, res) {
        if (err) {
          console.log(err);
        }
        console.log(res);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // const isloggedIn=req.session.isloggedIn;
  // const isloggedIn = req.get("Cookie").split(";")[2].trim().split("=")[1];
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationError:[]
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No Account With that email found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        var email_send = {
          to: req.body.email,
          from: "frana7738@gmail.com",
          subject: "Password Reset",
          html: `<p>You requested a password reset</p>
    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password</p>
    `,
        };

        mailer.sendMail(email_send, function (err, res) {
          if (err) {
            console.log(err);
          }
          console.log(res);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      console.log(message);
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "new password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
