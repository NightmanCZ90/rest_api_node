const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

afterEach(() => {
  delete mongoose.connection.models['User'];
});

describe('Auth Controller - Login', () => {
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
});