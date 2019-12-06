const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NoteSchema = new Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		user: { type: Schema.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Note", NoteSchema);
