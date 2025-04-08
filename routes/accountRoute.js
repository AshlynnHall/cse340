// Needed Resources 
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require('../utilities/account-validation');

// login route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// register route
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// account management route
router.get("/",utilities.checkLogin, utilities.handleErrors(accountController.accountManagement));

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt"); // Clear the JWT cookie
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/account/login"); 
});

// Route to build the update account view
router.get(
  "/update/:id",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process account update
router.post(
  "/update",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.updateAccount)
);

// Process password update
router.post(
  "/update-password",
  utilities.checkLogin, 
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;