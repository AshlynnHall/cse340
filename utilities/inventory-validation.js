const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const invValidate = {};

/****************************************
 * Classification Data Validation Rules
 ****************************************/
invValidate.classificationRules = () => {
  return [
    // required and must be a string
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a valid classification name.")
      .matches(/^[A-Za-z]+$/)
      .withMessage(
        "Must contain only letters (no spaces or special characters)"
      )
      .custom(async (classification_name) => {
        const classificationExists =
          await inventoryModel.checkExistingClassification(classification_name);
        if (classificationExists) {
          throw new Error("Classification exists. Try again.");
        }
      }),
  ];
};

/***********************************************************
 * Check & return error or continue to add-classification
 ***********************************************************/
invValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/*****************************************
 * New Inventory Data Validation Rules
 *****************************************/
invValidate.inventoryRules = () => {
  return [
    // make must be at least 3 characters, letters, numbers, space, and dash ok. First and Last are letters.
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage('"Make" must be at least 3 characters')
      .matches(/^[A-Za-z][A-Za-z0-9 \-]{1,}[A-Za-z]$/)
      .withMessage(
        '"Make" must start and end with a letter. Only letter, number, space, and dash characters are allowed.'
      ),
    // must be at least 1 character, letters, numbers, space, and these special characters ok [.'/+-].
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage('Please provide valid "Model" - at least 1 character')
      .matches(/^[A-Za-z0-9.\'+ \-]+/)
      .withMessage(
        `"Model" can only use letters, numbers, spaces, and these special characters [.'+-]`
      ),
    // Description
    // 4-digit number
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength(4)
      .withMessage('Please provide valid 4-digit "Year"')
      .isNumeric({ min: 1800 })
      .withMessage("Must be a number after 1800"),
    // Description
    // must be a min 12 characters
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 12 }, { max: 250 })
      .withMessage("Must use between 12 & 250 characters"),
    // Image
    // required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("File path is required")
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9_\-]+\.(jpeg|png|webp|avif|gif|jpg)$/i)
      .withMessage(
        'Picture path must begin "/images/vehicles/" and be a picture file [jpeg, png, gif, webp, avif, jpg]. Allowed special characters [_-].'
      )
      .custom((value) => {
        console.log("Validating inv_image:", value); // Debugging statement
        return true;
      }),
    // Thumbnail
    // required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("File path is required")
      .matches(/^\/images\/vehicles\/[a-zA-Z0-9_\-]+\.(jpeg|png|webp|avif|gif|jpg)$/i)
      .withMessage(
        'Small picture path must begin "/images/vehicles/" and be a picture file [jpeg, png, gif, webp, avif, jpg]. Allowed special characters [_-].'
      )
      .custom((value) => {
        console.log("Validating inv_thumbnail:", value); // Debugging statement
        return true;
      }),
    // Price
    // must be a number
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric({ min: 0 })
      .withMessage('"Price" must be a positive number'),
    // Miles 
    // must be an integer
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric({ min: 0 })
      .withMessage('"Miles" must be a positive number'),
    // Color
    // must be 3 letters
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage('"Color" must be at least 3 characters')
      .matches(/^[A-Za-z][A-Za-z ]{1,}[A-Za-z]$/)
      .withMessage(
        '"Color" must start and end with a letter. Only letters and spaces are allowed.'
      ),
    // Classification_id
    // must be in classification table
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification is required"),
  ];
};

/*******************************************************************
 * check & return error or continue to add-inventory item
 ********************************************************************/
invValidate.checkInventoryData = async (req, res, next) => {
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
  let errors = [];
  errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
        classification_id
    );
    res.render("./inventory/add-inventory", {
        errors: errors.array(),
        title: "Add New Inventory Item",
        nav,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classificationList,
    });
    return;
  }
  next();
};

/*******************************************************************
 * check & return error or continue to edit-inventory item
 ********************************************************************/
invValidate.checkUpdateData = async (req, res, next) => {
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
  let errors = [];
  errors = validationResult(req);

  console.log("Validation errors:", errors.array()); // Debugging statement

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
        classification_id
    );
    res.render("./inventory/edit-inventory", {
        errors: errors.array(),
        title: "Edit Inventory Item",
        inv_id,
        nav,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classificationList,
    });
    return;
  }
  next();
};


module.exports = invValidate;