const Note = require("../models/NoteModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
const mailer = require("../helpers/mailer");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Note Schema
function NoteData(data) {
	this._id = data._id;
	this.title = data.title;
	this.content = data.content;
	this.createdAt = data.createdAt;
}

/**
 * Note List.
 *
 * @returns {Object}
 */
exports.noteList = [
	auth,
	function(req, res) {
		try {
			Note.find(
				{ user: req.user._id },
				"_id title content createdAt",
			).then(notes => {
				if (notes.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						notes,
					);
				} else {
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						[],
					);
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Note Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.noteDetail = [
	auth,
	function(req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Note.findOne(
				{ _id: req.params.id, user: req.user._id },
				"_id title content createdAt",
			).then(note => {
				if (note !== null) {
					let noteData = new NoteData(note);
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						noteData,
					);
				} else {
					return apiResponse.successResponseWithData(
						res,
						"Operation success",
						{},
					);
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Note store.
 *
 * @param {string}      title
 * @param {string}      content
 *
 * @returns {Object}
 */
exports.noteStore = [
	auth,
	body("title", "Title must not be empty.")
		.isLength({ min: 1 })
		.trim(),
	body("content", "Content must not be empty.")
		.isLength({ min: 1 })
		.trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var note = new Note({
				title: req.body.title,
				user: req.user,
				content: req.body.content,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array(),
				);
			} else {
				//Save book.
				note.save(function(err) {
					if (err) {
						return apiResponse.ErrorResponse(res, err);
					}
					let noteData = new NoteData(note);
					mailer.send(process.env.EMAIL_SMTP_USERNAME, req.user.email, "Note created!", `Note ${noteData.title} created!`);
					return apiResponse.successResponseWithData(
						res,
						"Note add Success.",
						noteData,
					);
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Note update.
 *
 * @param {string}      title
 * @param {string}      content
 *
 * @returns {Object}
 */
exports.noteUpdate = [
	auth,
	body("title", "Title must not be empty.")
		.isLength({ min: 1 })
		.trim(),
	body("content", "Content must not be empty.")
		.isLength({ min: 1 })
		.trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			const note = new Note({
				title: req.body.title,
				content: req.body.content,
				_id: req.params.id,
			});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(
					res,
					"Validation Error.",
					errors.array(),
				);
			} else {
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(
						res,
						"Invalid Error.",
						"Invalid ID",
					);
				} else {
					Note.findById(req.params.id, function(err, foundNote) {
						if (foundNote === null) {
							return apiResponse.notFoundResponse(
								res,
								"Note not exists with this id",
							);
						} else {
							//Check authorized user
							if (foundNote.user.toString() !== req.user._id) {
								return apiResponse.unauthorizedResponse(
									res,
									"You are not authorized to do this operation.",
								);
							} else {
								//update book.
								Note.findByIdAndUpdate(req.params.id, note, {}, function(err) {
									if (err) {
										return apiResponse.ErrorResponse(res, err);
									} else {
										const noteData = new NoteData(note);
										mailer.send(process.env.EMAIL_SMTP_USERNAME, req.user.email, "Note updated", `Note ${noteData.title} updated!`);
										return apiResponse.successResponseWithData(
											res,
											"Note update Success.",
											noteData,
										);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];

/**
 * Note Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.noteDelete = [
	auth,
	function(req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(
				res,
				"Invalid Error.",
				"Invalid ID",
			);
		}
		try {
			Note.findById(req.params.id, function(err, foundNote) {
				if (foundNote === null) {
					return apiResponse.notFoundResponse(
						res,
						"Note not exists with this id",
					);
				} else {
					//Check authorized user
					if (foundNote.user.toString() !== req.user._id) {
						return apiResponse.unauthorizedResponse(
							res,
							"You are not authorized to do this operation.",
						);
					} else {
						//delete book.
						Note.findByIdAndRemove(req.params.id, function(err) {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							} else {
								return apiResponse.successResponse(res, "Note delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500.
			return apiResponse.ErrorResponse(res, err);
		}
	},
];
