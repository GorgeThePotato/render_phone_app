const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error:error.message })
  }
  next(error)
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('req-body', (req,) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :total-time ms :req-body'))

let persons = [
  {
    'id': 1,
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': 2,
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': 3,
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': 4,
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
]

app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id',(request,response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request,response,next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name,number },
    { new:true, runValidators:true,context:'query' }
  )
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {

  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error:'name missing' })
  }

  if (body.number === undefined) {
    return response.status(400).json({ error:'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (request,response) => {
  let totalPersons = persons.length
  let todaysDate = new Date()
  response.send(`<p>Phonebook has info for ${totalPersons} people</p>
  <br/>${todaysDate}`)
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`)
})