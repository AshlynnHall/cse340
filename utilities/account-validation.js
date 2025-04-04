const utilities = require(".")
const { body, validationResult } = require("express-validator")
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

module.exports = validate;