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

//GET route to the notes endpoint
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);


// promise version of fs.readfile
const readFromFile = util.promisify(fs.readFile);

// writes new note and stringifys
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`new note written and saved`)
);

// appends note to db.json
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


// GET route for retrieving existing note list as well as individual notes for display
app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)))
  });

  // POST route for adding new notes
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
      res.json();
    } else {
      res.error('Error in adding note');
    }
  });
  
  // delete request handler
app.delete("/api/notes/:id", function (req, res) {
    // loads the existing notes
    console.info(`${req.method} request received for notes`);
    let allNotesPath = path.join(__dirname, "/db/db.json");
    // searches for the index of the note to be deleted
    for (let i = 0; i < allNotes.length; i++) {

        if (allNotes[i].id == req.params.id) {
            // splices the selected entry from the array.
            allNotes.splice(i, 1);
            
        }
    }
    // Write the db.json file again without the selected note.
    fs.writeFileSync(allNotesPath, JSON.stringify(allNotes, null, 4), function (err) {

        if (err) {
            return console.log(err);
        } else {
            console.log("Your note was deleted!");
        }
    });
    //returns new db.json file back to client
    res.json(allNotes);
});

  

// wildcard route for unused routes - sends to 'root' endpoint

  app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

// listener for requests from server
app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);