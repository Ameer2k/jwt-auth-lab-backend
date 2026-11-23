const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getEntries,
  getMyEntries,
  createEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/entry.controller");

router.get("/", getEntries);
router.get("/my-entries", verifyToken, getMyEntries);
router.post("/", verifyToken, createEntry);
router.put("/:entryId", verifyToken, updateEntry);
router.delete("/:entryId", verifyToken, deleteEntry);

module.exports = router;
