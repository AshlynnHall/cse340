const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles", nav, grid,
  })
}

/* ***************************
 *  Build item view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const item_id = req.params.invId;
  const data = await invModel.getItemByInvId(item_id);
  const details = await utilities.buildItemView(data);
  let nav = await utilities.getNav();
  const itemName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`;
  res.render("./inventory/detail", {
    title: itemName, nav, details,
  });
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildMgmt = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Process Adding New Classification
 * ************************** */
invCont.processNewClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  // Add the new classification
  const result = await invModel.addNewClassification(classification_name);

  if (result) {
    req.flash(
      "notice",
      `${classification_name} has been added successfully as a category!`
    );
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to add ${classification_name}. Please try again.`
    );
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name,
      errors: null,
    });
  }
};

/* ***************************
 *  Build Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    errors: null,
    classificationList,
  });
};

/* ***************************
 *  Process Adding New Inventory Item
 * ************************** */
invCont.processNewInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  // Add the new item
  const result = await invModel.addNewInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (result) {
    req.flash(
      "notice",
      `The ${inv_year} ${inv_make} ${inv_model} has been added successfully to the inventory!`
    );
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to add the ${inv_year} ${inv_make} ${inv_model}. Please try again.`
    );

    let classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      locals: req.body, // Pass the entire form data for sticky form
      classificationList,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont