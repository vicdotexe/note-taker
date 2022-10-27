const express = require('express');
const PORT = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const server = express();

server.use(express.json());
server.use(express.urlencoded({extended:true}));
server.use(express.static("public"));

server.get("/notes", (req,res)=>{
    res.sendFile(path.join(__dirname, "./public/notes.html"));
})

server.get("/api/notes", (req,res)=>{
    fs.readFile("./db/db.json", "utf-8", (err,data)=>{
        if (err){
            return res.status(500).send("error reading database");
        }else{
            const notes = JSON.parse(data);
            res.json(notes);
        }
    });
})

server.post("/api/notes", (req,res)=>{
    const note = req.body;
    note.id = crypto.randomUUID();
    fs.readFile("./db/db.json", "utf-8", (err,data)=>{
        if (err){
            return res.status(500).send("error reading database");
        }else{
            const notes = JSON.parse(data);
            notes.push(note);
            fs.writeFile("./db/db.json", JSON.stringify(notes),(err)=>{if (err){throw err;}});
            res.json(notes);
        }
    });
});

server.delete("/api/notes/:id", (req,res)=>{
    const uuid = req.params.id;
    fs.readFile("./db/db.json", "utf-8", (err,data)=>{
        if (err){
            return res.status(500).send("error reading database");
        }else{
            const notes = JSON.parse(data);
            const index = notes.findIndex(x=>x.id == uuid);
            if (index != -1){
                notes.splice(index, 1);
            }
            fs.writeFile("./db/db.json", JSON.stringify(notes),(err)=>{if (err){throw err;}});
            res.json(notes);
        }
    });
})

server.get("*", (req,res)=>{
    res.sendFile(path.join(__dirname, "./public/index.html"));
})

server.listen(PORT, ()=>{console.log(`Listening on port ${PORT}`)});