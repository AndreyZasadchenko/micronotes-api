const { chai, server } = require("./testConfig");
const NoteModel = require("../models/NoteModel");

/**
 * Test cases to test all the book APIs
 * Covered Routes:
 * (1) Login
 * (2) Store book
 * (3) Get all books
 * (4) Get single book
 * (5) Update book
 * (6) Delete book
 */

describe("Note", () => {
	//Before each test we empty the database
	before(done => {
		NoteModel.deleteMany({}, () => {
			done();
		});
	});

	// Prepare data for testing
	const userTestData = {
		password: "Test@123",
		email: "maitraysuthar@test12345.com",
	};

	// Prepare data for testing
	const testData = {
		title: "testing book",
		content: "testing book desc",
	};

	/*
   * Test the /POST route
   */
	describe("/POST Login", () => {
		it("it should do user Login for note", done => {
			chai
				.request(server)
				.post("/api/auth/login")
				.send({ email: userTestData.email, password: userTestData.password })
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Login Success.");
					userTestData.token = res.body.data.token;
					done();
				});
		});
	});

	/*
   * Test the /POST route
   */
	describe("/POST Note Store", () => {
		it("It should send validation error for store note", done => {
			chai
				.request(server)
				.post("/api/note")
				.send()
				.set("Authorization", "Bearer " + userTestData.token)
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});

	/*
   * Test the /POST route
   */
	describe("/POST Note Store", () => {
		it("It should store note", done => {
			chai
				.request(server)
				.post("/api/note")
				.send(testData)
				.set("Authorization", "Bearer " + userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Note add Success.");
					done();
				});
		});
	});

	/*
   * Test the /GET route
   */
	describe("/GET All note", () => {
		it("it should GET all the notes", done => {
			chai
				.request(server)
				.get("/api/note")
				.set("Authorization", "Bearer " + userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Operation success");
					testData._id = res.body.data[0]._id;
					done();
				});
		});
	});

	/*
   * Test the /GET/:id route
   */
	describe("/GET/:id note", () => {
		it("it should GET the notes", done => {
			chai
				.request(server)
				.get("/api/note/" + testData._id)
				.set("Authorization", "Bearer " + userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Operation success");
					done();
				});
		});
	});

	/*
   * Test the /PUT/:id route
   */
	describe("/PUT/:id note", () => {
		it("it should PUT the notes", done => {
			chai
				.request(server)
				.put("/api/note/" + testData._id)
				.send(testData)
				.set("Authorization", "Bearer " + userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Note update Success.");
					done();
				});
		});
	});

	/*
   * Test the /DELETE/:id route
   */
	describe("/DELETE/:id note", () => {
		it("it should DELETE the notes", done => {
			chai
				.request(server)
				.delete("/api/note/" + testData._id)
				.set("Authorization", "Bearer " + userTestData.token)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Note delete Success.");
					done();
				});
		});
	});
});
