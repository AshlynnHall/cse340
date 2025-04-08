const invModel = require("../models/inventory-model")
require("dotenv").config();
const jwt = require("jsonwebtoken")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the item detail view HTML
 * ************************************ */
Util.buildItemView = async function (data) {
  if (!data) {
    return "<p>Item Detail is not available.</p>";
  }
  const make = data.inv_make;
  const model = data.inv_model;
  const year = data.inv_year;
  const desc = data.inv_description;
  const imgSm = data.inv_thumbnail;
  const imgLg = data.inv_image;
  const price = Number(data.inv_price).toLocaleString();
  const miles = Number(data.inv_miles).toLocaleString();
  const color = data.inv_color;

  return `
    <div id="item-display">
      <img id="imgSm" src="${imgSm}" alt="${make} ${model}"/>
      <img id="imgLg" src="${imgLg}" alt="${make} ${model}"/>
      <div id="item-details">
        <h2>${make} ${model} Details</h2>
        <p><b>Price: $${price}</p></b>
        <p><b>Description:</b> ${desc}</p>
        <p><b>Color:</b> ${color}</p>
        <p><b>Mileage:</b> ${miles}</p>
        <p><b>Year:</b> ${year}</p>
    </div>
  `;
};

/* **************************************
 * Add iventory classification view HTML
 * ************************************ */

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 *  Middleware for checking the JWT token
 * ************************************ */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    res.locals.loggedin = false;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    res.locals.accountData = decoded; // Set accountData in res.locals
    res.locals.loggedin = true;
    next();
  } catch (err) {
    res.locals.loggedin = false;
    next();
  }
};

/* ****************************************
 * Middleware to check account type
 * Only allows "Employee" or "Admin" access
 **************************************** */
Util.checkAccountType = (req, res, next) => {
  const accountData = res.locals.accountData; // Extract account data from JWT
  if (!accountData || (accountData.account_type !== "Employee" && accountData.account_type !== "Admin")) {
    req.flash("notice", "You do not have permission to access this resource.");
    return res.redirect("/account/login"); // Redirect to login page
  }
  next(); // Allow access if account type is valid
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
 }


module.exports = Util;