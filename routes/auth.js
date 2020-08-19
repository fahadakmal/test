const authController = require("../controllers/auth");
const express = require("express");
const User=require('../models/user');
const { check,body } = require("express-validator/check");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login",[check("email")
.isEmail()
.withMessage("Please Enter A valid Email Address ")
.normalizeEmail()
.custom((value,{req})=>{
// if(value === 'test@gmail.com')
// {
//     throw new Error('your email is forbidden');
// }
// return true;

return User.findOne({ email: value })
.then(userDoc => {
if (!userDoc) {
return Promise.reject('Email not exist.Please pick a different One');
}
});

}),

], authController.postLogin
);
router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [
  check("email")
    .isEmail()
    .withMessage("Please Enter A valid Email Address ")
    .normalizeEmail()

    .custom((value,{req})=>{
// if(value === 'test@gmail.com')
// {
//     throw new Error('your email is forbidden');
// }
// return true;

return User.findOne({ email: value })
.then(userDoc => {
  if (userDoc) {
  return Promise.reject('Email exist already.Please pick a different One');
  }
    });
    
}),
    body('password','Plz enter an aplphanumeric aleast 5 words').isLength({min:5}).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value,{req})=>{
        if(value !== req.body.password)
        {
            throw new Error('Pssword and confirm password should be same');

        }
        return true;
    })
],
  authController.postSignUp
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
