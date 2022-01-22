const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.a0hh5.mongodb.net/${process.env.MONGO_TEST_DATABASE}?retryWrites=true&w=majority`

describe('Auth Controller', () => {
  before(async () => {
    await mongoose.connect(MONGODB_URI);
    const user = new User({
      email: 'test@test.com',
      password: 'testtest',
      name: 'Test',
      posts: [],
      _id: '5c0f66b979af55031b34728a'
    });
    await user.save();
  })

  after(async () => {
    delete mongoose.connection.models['User'];
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('should throw an error with code 500 if accessing the database fails', async () => {
    sinon.stub(User, 'findOne');
    await User.findOne.throws();

    const req = {
      body: {
        email: 'test@test.com',
        password: 'testtest',
      }
    }
    
    const result = await AuthController.login(req, {}, () => {});

    expect(result).to.be.an('error');
    expect(result).to.have.property('statusCode', 500);

    User.findOne.restore();
  });

  it('should send a response with a valid user status for an existing user', async () => {
    const req = { userId: '5c0f66b979af55031b34728a' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.userStatus = data.status;
      }
    }

    await AuthController.getUserStatus(req, res, () => {});

    expect(res.statusCode).to.be.equal(200);
    expect(res.userStatus).to.be.equal('I am new!');
  });
});