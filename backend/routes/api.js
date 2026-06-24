const express = require("express");
const router = express.Router();

// IMPOR MIDDLEWARE
const verifyToken = require("../middleware/authMiddleware"); 
const { requireAdmin } = require("../middleware/roleMiddleware");

// IMPOR CONTROLLERS
const authController = require("../controllers/AuthController");
const usersController = require("../controllers/UsersController");
const customerController = require("../controllers/CustomerController");
const leadController = require("../controllers/LeadController");
const dealController = require("../controllers/DealController");
const contactsController = require("../controllers/contactsController");
const activitiesController = require("../controllers/activitiesController");

// ==========================================
// RUTE PUBLIK (Tidak butuh Token)
// ==========================================
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register); // Tambahkan ini agar bisa buat user baru

// ==========================================
// RUTE TERPROTEKSI (Wajib Login & Opsional Admin)
// ==========================================

// --- 1. MANAJEMEN USERS (Hanya Admin) ---
router.get("/users", verifyToken, requireAdmin, usersController.index);
router.get("/users/:id", verifyToken, requireAdmin, usersController.show);
router.post("/users", verifyToken, requireAdmin, usersController.store);
router.put("/users/:id", verifyToken, requireAdmin, usersController.update);
router.delete("/users/:id", verifyToken, requireAdmin, usersController.delete);

// --- 2. CUSTOMERS ---
router.get("/customers", verifyToken, customerController.index);
router.get("/customers/:id", verifyToken, customerController.show);
router.post("/customers", verifyToken, customerController.store);
router.put("/customers/:id", verifyToken, customerController.update);
router.delete("/customers/:id", verifyToken, requireAdmin, customerController.destroy); 

// --- 3. LEADS ---
router.get("/leads", verifyToken, leadController.index);
router.get("/leads/:id", verifyToken, leadController.show);
router.post("/leads", verifyToken, leadController.store);
router.put("/leads/:id", verifyToken, leadController.update);
router.delete("/leads/:id", verifyToken, requireAdmin, leadController.destroy); 

// --- 4. DEALS ---
router.get("/deals", verifyToken, dealController.index);
router.get("/deals/:id", verifyToken, dealController.show);
router.post("/deals", verifyToken, dealController.store);
router.put("/deals/:id", verifyToken, dealController.update);
router.delete("/deals/:id", verifyToken, requireAdmin, dealController.destroy); 

// --- 5. CONTACTS ---
router.get("/contacts", verifyToken, contactsController.index);
router.get("/contacts/:id", verifyToken, contactsController.show);
router.post("/contacts", verifyToken, contactsController.store);
router.put("/contacts/:id", verifyToken, contactsController.update);
router.delete("/contacts/:id", verifyToken, requireAdmin, contactsController.destroy); 

// --- 6. ACTIVITIES ---
router.get("/activities", verifyToken, activitiesController.index);
router.get("/activities/:id", verifyToken, activitiesController.show);
router.post("/activities", verifyToken, activitiesController.store);
router.put("/activities/:id", verifyToken, activitiesController.update);
router.delete("/activities/:id", verifyToken, requireAdmin, activitiesController.destroy); 

module.exports = router;