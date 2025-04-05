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
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId);
  let nav = await utilities.getNav();
  const itemData = await invModel.getItemByInvId(inv_id);
  if (!itemData) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }
  const classificationList = await utilities.buildClassificationList(itemData.classification_id); // Corrected variable name
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList, // Pass the dropdown list to the view
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Update Inventory Item
 * ************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_id,
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

  const result = await invModel.updateInventory(
    inv_id,
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
      `The ${inv_year} ${inv_make} ${inv_model} has been updated successfully!`
    );
    res.redirect("/inv");
  } else {
    req.flash(
      "notice",
      `Failed to add the ${inv_year} ${inv_make} ${inv_model}. Please try again.`
    );

    let classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      locals: req.body, // Pass the entire form data for sticky form
      classificationSelect: classificationSelect,
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

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId);
  let nav = await utilities.getNav();
  const itemData = await invModel.getItemByInvId(inv_id);
  if (!itemData) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv");
  }
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year
  });
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const { inv_id } = req.body; // Extract only the inv_id from the request body

  console.log("Deleting inventory item with ID:", inv_id); // Debugging statement

  try {
    const result = await invModel.deleteInventory(inv_id); // Call the model function with inv_id

    console.log("Delete result:", result); // Debugging statement

    if (result.rowCount > 0) {
      req.flash("notice", "The inventory item has been successfully deleted!");
      res.redirect("/inv"); // Redirect to the inventory management page
    } else {
      req.flash("notice", "Failed to delete the inventory item. Please try again.");
      res.redirect("/inv"); // Redirect back to the inventory management page
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error); // Debugging statement
    req.flash("notice", "An error occurred while trying to delete the inventory item.");
    res.status(500).redirect("/inv"); // Redirect with an error status
  }
};

module.exports = invCont;