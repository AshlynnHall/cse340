const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
      body("account_firstname")
          .trim()
          .escape()
          .notEmpty()
          .isLength({ min: 1 })
          .withMessage("Please provide a first name."),
      body("account_lastname")
          .trim()
          .escape()
          .notEmpty()
          .isLength({ min: 2 })
          .withMessage("Please provide a last name."),
      body("account_email")
          .trim()
          .escape()
          .notEmpty()
          .isEmail()
          .normalizeEmail()
          .withMessage("A valid email is required."),
      body("account_password")
          .trim()
          .notEmpty()
          .isStrongPassword({
              minLength: 12,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
          })
          .withMessage("Password does not meet requirements."),
  ];
};

/* **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
      body("account_email")
          .trim()
          .escape()
          .notEmpty()
          .isEmail()
          .normalizeEmail()
          .withMessage("A valid email is required."),
      body("account_password")
          .trim()
          .notEmpty()
          .withMessage("Password is required."),
  ];
};

/* ******************************
* Check registration data
* ***************************** */
validate.checkRegData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/register", {
          errors,
          title: "Registration",
          nav,
          account_firstname: req.body.account_firstname,
          account_lastname: req.body.account_lastname,
          account_email: req.body.account_email,
      });
      return;
  }
  next();
};

/* ******************************
* Check login data
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/login", {
          errors,
          title: "Login",
          nav,
          account_email: req.body.account_email,
      });
      return;
  }
  next();
};

/* **********************************
 *  Update Account Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
    return [
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."),
      body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
          const account = await accountModel.getAccountByEmail(account_email);
          if (account && account.account_id !== parseInt(req.body.account_id)) {
            throw new Error("Email already exists. Please use a different email.");
          }
        }),
    ];
  };
  
  /* **********************************
   *  Update Password Validation Rules
   * ********************************* */
  validate.updatePasswordRules = () => {
    return [
      body("current_password")
        .trim()
        .notEmpty()
        .withMessage("Current password is required."),
      body("new_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage(
          "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
        ),
      body("confirm_password")
        .trim()
        .notEmpty()
        .custom((confirm_password, { req }) => {
          if (confirm_password !== req.body.new_password) {
            throw new Error("New password and confirmation do not match.");
          }
          return true;
        }),
    ];
  };
  
  /* ******************************
   * Check Update Account Data
   * ***************************** */
  validate.checkUpdateAccountData = async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/update", {
        errors: errors.array(),
        title: "Update Account Information",
        nav,
        accountData: req.body,
      });
      return;
    }
    next();
  };
  
  /* ******************************
   * Check Update Password Data
   * ***************************** */
  validate.checkUpdatePasswordData = async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/update", {
        errors: errors.array(),
        title: "Update Account Information",
        nav,
        accountData: { account_id: req.body.account_id },
      });
      return;
    }
    next();
  };

module.exports = validate;