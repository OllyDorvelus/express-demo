const debug = require('debug')('app:startup')
const dbDebugger = require('debug')('app:db')
const config = require('config')
const express = require('express')
const app = express();
const Joi = require('joi');
const logger = require('./logger')
const authenticate = require('./authenticate')
const helmet = require('helmet')
const morgan = require('morgan')


debug(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`app: ${app.get('env')}`)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use(morgan('tiny'))

app.use(logger);
app.use(authenticate)

debug("config mail host " + config.get('mail.host'))
dbDebugger('Connected to the database ...')

const courses = [
  { id: 1, name: 'course1'},
  { id: 2, name: 'course2'},
  { id: 3, name: 'course3'}
];

// app.get();
// app.post();
// app.put();
// app.delete();

app.get('/', (req, res) => {
  res.send('Hello World!!!');
});

app.get('/api/courses', (req, res) => {
   res.send(courses)
})

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('The course with the given ID was not found.') // 404
  res.send(course)

})

app.post('/api/courses', (req, res) => {


  const { error } = validateCourse(req.body);

  if(error) return res.status(400).send(error.details[0].message);


  const course = {
    id: courses.length + 1,
    name: req.body.name
  };
  courses.push(course);
  res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
  // Look up the course
  // If not exsiting, return 404
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('The course with the given ID was not found.') // 404

  const { error } = validateCourse(req.body);

  if(error) return res.status(400).send(error.details[0].message);  // 400 Bad request

  course.name = req.body.name;
  res.send(course)

})

app.delete('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if(!course) return res.status(404).send('The course with the given ID was not found.')

  const index = courses.indexOf(course);
  courses.splice(index, 1)

  res.send(course);
})

function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required()
  };

  return Joi.validate(course, schema)
}
// PORT enviornment variable
const port = process.env.PORT  || 3000;
app.listen(3000, () => console.log(`Listening on port ${port}...`))
