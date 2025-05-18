import express from "express";
import { Note } from "../../../models/Note.js";
import {
  getAllNotes,
  createNote,
  addNote,
  editNote,
  togglePin,
  getUserNotes,
  deleteUserNote,
  searchUserNotes,
  getNoteById,
} from "./controllers/notesController.js";
import { authUser } from "../../../middleware/auth.js";
import { User } from "../../../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/notes", getAllNotes);

router.post("/notes", createNote);

router.post("/add-note", authUser, addNote);

router.put("/edit-note/:noteId", authUser, editNote);

router.put("/update-note-pinned/:noteId", authUser, togglePin);

router.get("/get-all-notes", authUser, getUserNotes);

router.delete("/delete-note/:noteId", authUser, deleteUserNote);

router.get("/search-notes", authUser, searchUserNotes);

router.get("/get-note/:noteId", authUser, getNoteById);

router.get("/public-profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "fullName email"
    );
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    res.status(200).json({ error: false, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

router.get("/public-notes/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: true, message: "Invalid user ID" });
  }
  try {
    const notes = await Note.find({
      userId,
      isPublic: true,
    }).sort({ createdOn: -1 });
    res.status(200).json({ error: false, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

router.put("/notes/:noteId/visibility", authUser, async (req, res) => {
  const { isPublic } = req.body;
  const { user } = req.user;
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, userId: user._id },
      { isPublic },
      { new: true }
    );
    if (!note) {
      return res
        .status(404)
        .json({ error: true, message: "Note not found or unauthorized" });
    }
    res.status(200).json({ error: false, note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

export default router;
