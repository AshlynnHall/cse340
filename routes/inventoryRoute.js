// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);


// Route to build item view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
);

// Route to build management view
router.get(
  "/",
  utilities.handleErrors(invController.buildMgmt)
);

// Route to build add-classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to post add-classification view
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.processNewClassification)
);

// Route to build add-inventory view
router.get(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to post add-inventory view
router.post(
  "/add-inventory",
  invValidate.inventoryRules(), // Validation rules middleware
  invValidate.checkInventoryData, // Validation check middleware
  utilities.handleErrors(invController.processNewInventory)
);

module.exports = router;