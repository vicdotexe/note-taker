const express = require('express');
const PORT = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const server = express();

server.use(express.json());
server.use(express.urlencoded({extended:true}));
server.use(express.static("public"));

// send to the notes.html page
server.get("/notes", (req,res)=>{
    res.sendFile(path.join(__dirname, "./public/notes.html"));
})

// send all back the stored notes
server.get("/api/notes", (req,res)=>{
    fs.readFile("./db/db.json", "utf-8", (err,data)=>{
        if (err){
            return res.status(500).send("error reading database");
        }
        const notes = JSON.parse(data);
        res.json(notes);
    });
})

// push the new note to the database after assigning it a random id
server.post("/api/notes", (req,res)=>{
    const note = req.body;
    note.id = crypto.randomUUID();
    fs.readFile("./db/db.json", "utf-8", (err,data)=>{
        if (err){
            return res.status(500).send("error reading database");
        }
        const notes = JSON.parse(data);
        notes.push(note);
        fs.writeFile("./db/db.json", JSON.stringify(notes),(err)=>{if (err){throw err;}});
        res.json(notes);
    });
});

// remove a note, by it's id, from the database.
server.delete("/api/notes/:id", (req,res)=>{
    const uuid = req.params.id;

    fs.readFile("./db/db.json", "utf-8", (err,data)=>{
        if (err){
            return res.status(500).send("error reading database");
        }
        const notes = JSON.parse(data);
        const index = notes.findIndex(x=>x.id == uuid);
        if (index != -1){
            notes.splice(index, 1);
            fs.writeFile("./db/db.json", JSON.stringify(notes),(err)=>{if (err){throw err;}});
            res.send(`Note ${uuid} deleted.`);
        }else{
            res.status(400).send(`Note ID '${uuid}' not found in database.`)
        }
    });
})

// send client to index.html if they wander off
server.get("*", (req,res)=>{
    res.sendFile(path.join(__dirname, "./public/index.html"));
})

// start listening
server.listen(PORT, ()=>{console.log(`Listening on port ${PORT}`)});