const { expect } = require('chai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

dotenv.config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.a0hh5.mongodb.net/${process.env.MONGO_TEST_DATABASE}?retryWrites=true&w=majority`

describe('Feed Controller', () => {
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
    delete mongoose.connection.models['Post'];
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  it('should add a created post to the posts of the creator', async () => {

    const req = {
      body: {
        title: 'Test Post',
        content: 'A Test Post',
      },
      file: {
        path: 'abcdefg',
      },
      userId: '5c0f66b979af55031b34728a',
    };
    const res = { status: () => {return res}, json: () => {}};
    const savedUser = await FeedController.createPost(req, res, () => {});

    expect(savedUser).to.have.property('posts');
    expect(savedUser.posts).to.have.length(1);

  });
});