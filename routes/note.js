const express = require("express");
const NoteController = require("../controllers/NoteController");

const router = express.Router();

router.get("/", NoteController.noteList);
router.get("/:id", NoteController.noteDetail);
router.post("/", NoteController.noteStore);
router.put("/:id", NoteController.noteUpdate);
router.delete("/:id", NoteController.noteDelete);

module.exports = router;
