const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver the login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}
  

/* ****************************************
*  Deliver the registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}
  
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )
  
  if (regResult) {
    req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }
  }  


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function accountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  const accountId = req.params.id; // Get the account ID from the route
  const accountData = await accountModel.getAccountById(accountId); // Fetch account data
  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/");
  }
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    accountData,
    errors: null,
  });
}

/* ****************************************
 *  Process Update Account Request
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
    const updatedAccount = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
    if (updatedAccount) {
      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Failed to update account information.");
      res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        accountData: { account_id, account_firstname, account_lastname, account_email },
        errors: null,
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred while updating the account.");
    res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      accountData: { account_id, account_firstname, account_lastname, account_email },
      errors: null,
    });
  }
}

/* ****************************************
 *  Process Password Update Request
 * ************************************ */
async function updatePassword(req, res) {
  console.log("Request body:", req.body); // Debugging statement
  let nav = await utilities.getNav();
  const { account_id, current_password, new_password, confirm_password } = req.body;

  // Check if new password and confirm password match
  if (new_password !== confirm_password) {
    req.flash("notice", "New password and confirmation do not match.");
    return res.status(400).render("account/update", {
      title: "Update Account Information",
      nav,
      accountData: { account_id },
      errors: null,
    });
  }

  try {
    // Fetch the current account data
    const accountData = await accountModel.getAccountById(account_id);
    console.log("Fetched account data:", accountData); // Debugging statement
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    // Verify the current password
    const validPassword = await bcrypt.compare(current_password, accountData.account_password);
    console.log("Password verification result:", validPassword); // Debugging statement
    if (!validPassword) {
      req.flash("notice", "Current password is incorrect.");
      return res.status(400).render("account/update", {
        title: "Update Account Information",
        nav,
        accountData: { account_id },
        errors: null,
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);
    console.log("Hashed new password:", hashedPassword); // Debugging statement

    // Update the password in the database
    const updatedPassword = await accountModel.updatePassword(account_id, hashedPassword);
    console.log("Password update result:", updatedPassword); // Debugging statement
    if (updatedPassword) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Failed to update password.");
      return res.status(500).render("account/update", {
        title: "Update Account Information",
        nav,
        accountData: { account_id },
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("notice", "An error occurred while updating the password.");
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      accountData: { account_id },
      errors: null,
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, accountManagement, buildUpdateAccount, updateAccount, updatePassword }