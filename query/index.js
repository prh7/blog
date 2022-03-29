const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
  res.send(posts);
});

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data; 
    console.log(posts)
    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === 'CommentUpdated') {
    console.log(data)
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find(comment => {
      return comment.id === id;
    });

    comment.status = status;
    comment.content = content;
  }
}

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  
  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log('Query service is running on 4002');

  try {
	const res = await axios.get('http://event-bus-srv:4005/events');

	for (let event of res.data) {
		console.log('Procession event: ', event.type);

		handleEvent(event.type, event.data);
	}
  } catch (err) {
	  console.log(err.message)
  }
});