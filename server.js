const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
//uuidv4();
const app = express();
const allNotes = require('./db/db.json'); 
const router = express.Router();
const PORT = 3001;



// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//GET route for homepage



app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);



const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
);

const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};



app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
  });

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a note`);
  
    const { title, text } = req.body;
  
    if (req.body) {
      const newNote = {
        title,
        text,
        id: uuidv4(),
      };
  
      readAndAppend(newNote, './db/db.json');
      res.json(`Note added successfully 🚀`);
    } else {
      res.error('Error in adding note');
    }
  });

//   const readAndDelete = (content, file) => {
//     fs.readFile(file, 'utf8', (err, data) => {
//         if (err) {
//             console.log(err);
//         } else {
//             const allNotes = JSON.parse(data);
//             allNotes.splice(content, 1);
            
//         }
//     })
// }

//  app.delete('api/notes/:id', (req, res) => {
//     let db = JSON.parse(fs.readFile('./db/db.json'))
//     let deleteNotes = db.filter(i => i.id !== req.params.id);
//     fs.writeFile('./db/db.json', JSON.stringify(deleteNotes));
//     res.json(deleteNotes);
//     // console.log(id);
//     // const noteDel = noteId.findIndex(i => i.id == id);
//     // console.log(noteDel);
//     // readAndDelete(noteDel, './db/db.json');
//     // return res.json(id);
    
//  });

app.delete("/api/notes/:id", function (req, res) {
    let allNotesPath = path.join(__dirname, "/db/db.json");
    // request to delete note by id.
    for (let i = 0; i < allNotes.length; i++) {

        if (allNotes[i].id == req.params.id) {
            // Splice takes i position, and then deletes the 1 note.
            allNotes.splice(i, 1);
            
        }
    }
    // Write the db.json file again.
    fs.writeFileSync(allNotesPath, JSON.stringify(allNotes, null, 4), function (err) {

        if (err) {
            return console.log(err);
        } else {
            console.log("Your note was deleted!");
        }
    });
    res.json(allNotes);
});

  



  app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);