// server.js

// Required modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const Post = require('./models/Post');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Connect to MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/my-blog'; // Replace with your MongoDB URI
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes

// Home route - Display all posts
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.render('index', { posts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send('Error fetching posts');
  }
});

// New post form route
app.get('/posts/new', (req, res) => {
  res.render('new');
});

// Create new post route
app.post('/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({ title, content });
    await post.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Error creating post');
  }
});

// Edit post form route
app.get('/posts/:id/edit', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render('edit', { post });
  } catch (err) {
    console.error('Error fetching post for edit:', err);
    res.status(500).send('Error fetching post for edit');
  }
});

// Update post route
app.put('/posts/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    await Post.findByIdAndUpdate(req.params.id, { title, content });
    res.redirect('/');
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).send('Error updating post');
  }
});

// Delete post route
app.delete('/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).send('Error deleting post');
  }
});

// Search route - Display search results
app.get('/search', async (req, res) => {
  const query = req.query.query;
  try {
    // Find blog posts that match the query (case-insensitive partial search)
    const post = await Post.findOne({ title: { $regex: new RegExp(query, 'i') } });
    if (post) {
      res.redirect(`/posts/${post._id}`);
    } else {
      res.render('search', { posts: [] });
    }
  } catch (err) {
    console.error('Error searching blog posts:', err);
    res.status(500).send('Error searching blog posts');
  }
});

// Suggestions route - Provide search suggestions
app.get('/suggestions', async (req, res) => {
  const query = req.query.query;
  try {
    // Find blog posts that match the query (case-insensitive partial search)
    const posts = await Post.find({ title: { $regex: new RegExp(query, 'i') } }).limit(10); // Limit to 10 results
    res.json(posts);
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    res.status(500).send('Error fetching suggestions');
  }
});

// View post route - Display individual post
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('post', { post });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).send('Error fetching post');
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.query;
  try {
    // Find blog posts that match the query (example using regex for case-insensitive partial search)
    const posts = await Post.find({ title: { $regex: new RegExp(query, 'i') } }).limit(10); // Limit to 10 results
    res.json(posts);
  } catch (err) {
    console.error('Error searching blog posts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
