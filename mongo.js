const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.18ud7ek.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  phonenumber: Number,
})

const Person = mongoose.model('Person',personSchema)

if (process.argv.length === 5) {

  const person = new Person({
    name: process.argv[3],
    phonenumber: process.argv[4],
  })
  person.save().then(result => {
    console.log(`added ${result.name} number ${result.phonenumber} to phonebook`)
    mongoose.connection.close()
  })
}

if(process.argv.length === 3){

  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })

}