const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ************************************
 *  Get an inventory item based on inv_id
 * ************************************ */
async function getItemByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0]; // Return the first row (inventory item)
  } catch (error) {
    console.error("getItemByInvId error " + error);
    throw error;
  }
}

/* ***************************
 *  Add New Classificiation
 * ************************** */
async function addNewClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name) 
      VALUES ($1) 
      RETURNING *;
    `;
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return "Classification could not be added.";
  }
}

/* ***************************
 *  Add New Inventory Item
 * ************************** */
async function addNewInventory(
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
) {
  try {
    const sql = `
      INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *;
    `;
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    console.log(`addNewInventory error results... ${error}`); // for testing
    return "Inventory Item could not be added.";
  }
}

/* ***************************
 * Check if a classification exists
 * ************************** */
async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT COUNT(*) FROM public.classification WHERE classification_name = $1";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0].count > 0; // Return true if classification exists
  } catch (error) {
    console.error("Error checking existing classification:", error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Item
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory 
      SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, 
          inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, 
          inv_color = $9, classification_id = $10 
      WHERE inv_id = $11 
      RETURNING *;
    `;
    return await pool.query(sql, [
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
      inv_id
    ]);
  } catch (error) {
    console.log(`addNewInventory error results... ${error}`); // for testing
    return "Inventory Item could not be added.";
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    return "Error: Item could not be deleted.";
  }
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getItemByInvId, 
  addNewClassification, 
  addNewInventory, 
  checkExistingClassification, 
  updateInventory,
  deleteInventory};