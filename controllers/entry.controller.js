const mongoose = require("mongoose");
const Entry = require("../models/Entry");

async function getEntries(req, res) {
  try {
    const entries = await Entry.find({ isPublic: true });
    return res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getMyEntries(req, res) {
  try {
    const entries = await Entry.find({ owner: req.user._id });
    return res.status(200).json(entries);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createEntry(req, res) {
  try {
    const { title, entryBody, isPublic } = req.body;
    const entry = await Entry.create({
      title,
      entryBody,
      isPublic,
      owner: req.user._id,
    });
    return res.status(201).json(entry);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function findOwnedEntry(req, res) {
  const { entryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    res.status(400).json({ message: "Invalid entry id." });
    return null;
  }

  const entry = await Entry.findById(entryId);
  if (!entry) {
    res.status(404).json({ message: "Entry not found." });
    return null;
  }
  if (String(entry.owner) !== String(req.user._id)) {
    res.status(403).json({ message: "You can only manage your own entries." });
    return null;
  }
  return entry;
}

async function updateEntry(req, res) {
  try {
    const entry = await findOwnedEntry(req, res);
    if (!entry) return;

    for (const field of ["title", "entryBody", "isPublic"]) {
      if (req.body[field] !== undefined) entry[field] = req.body[field];
    }

    await entry.save();
    return res.status(200).json(entry);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteEntry(req, res) {
  try {
    const entry = await findOwnedEntry(req, res);
    if (!entry) return;

    await entry.deleteOne();
    return res.status(200).json({ message: "Entry deleted." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  getEntries,
  getMyEntries,
  createEntry,
  updateEntry,
  deleteEntry,
};
