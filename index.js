// const express = require('express')
// const app = express()
// const cors = require('cors')
// require('dotenv').config()
// const Note = require('./models/note')


// app.use(cors())
// app.use(express.json())
// app.use(express.static('dist'))



// const mongoose = require('mongoose')

// // DO NOT SAVE YOUR PASSWORD TO GITHUB!!
// const password = process.argv[2]
// const url = `mongodb+srv://danp942942:Awesome942@cluster0.20k4hgq.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

// mongoose.set('strictQuery',false)
// mongoose.connect(url)

// let notes = [
//   {
//     id: "1",
//     content: "HTML is easy",
//     important: true
//   },
//   {
//     id: "2",
//     content: "Browser can execute only JavaScript",
//     important: false
//   },
//   {
//     id: "3",
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true
//   }
// ]


// //https request definitions

// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

// app.get('/api/notes', (request, response) => {
//   Note.find({}).then(notes => {
//     response.json(notes)
//   })
// })

// app.get('/api/notes/:id', (request, response) => {
//   Note.findById(request.params.id).then(note => {
//     response.json(note)
//   })
// })


// app.delete('/api/notes/:id', (request, response) => {
//   const id = request.params.id
//   notes = notes.filter(note => note.id !== id)

//   response.status(204).end()
// })

// app.put('/api/notes/:id', (request, response) => {
//   const id = request.params.id
//   const body = request.body

//   const note = {
//     id: id,
//     content: body.content,
//     important: body.important
//   }

//   let noteFound = false
//   notes = notes.map(n => {
//     if (n.id === id) {
//       noteFound = true
//       return note
//     }
//     return n
//   })
  
//   if (!noteFound) {
//     return response.status(404).json({ error: 'note not found' })
//   }
//   response.json(note)
// })


// const generateId = () => {
//   const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => Number(n.id)))
//     : 0
//   return String(maxId + 1)
// }

// app.post('/api/notes', (request, response) => {
//   const body = request.body

//   if (!body.content) {
//     return response.status(400).json({ 
//       error: 'content missing' 
//     })
//   }

//   const note = new Note({
//     content: body.content,
//     important: body.important || false,
//   })

//   note.save().then(savedNote => {
//     response.json(savedNote)
//   })
// })

// const PORT = process.env.PORT
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`)
// })


//official code 

require('dotenv').config()
const express = require('express')
const Note = require('./models/note')

const app = express()

let notes = []

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}



app.use(express.static('dist'))
app.use(express.json())
// app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
  
})

app.get('/api/notes/:id', (request, response, next) => {
  
  Note.findById(request.params.id)
  .then((note) => {
    if(note){
      response.json(note)
    }else{
      console.log('168');
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
  .then((savedNote) => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

