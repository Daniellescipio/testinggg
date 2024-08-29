const express = require("express")
const app = express()
const pg = require('pg')
const PORT = '3000'
const client = new pg.Client(process.env.DATABASEURL||'postgres://localhost/the_acme_notes_db')
app.use(express.json())
app.use(require('morgan')('dev'))

app.get('/api/notes',async(req,res,next)=>{
    try{
        const SQL = `
        SELECT * FROM notes ORDER BY created_at DESC;`
        const response = await client.query(SQL)
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})
app.post('/api/notes',async(req,res,next)=>{
    try{
        const body = req.body
        const txt = body.txt
        const SQL = `
        INSERT INTO notes(txt)
        VALUES($1)
        RETURNING *;`
        const response = await client.query(SQL,[txt])
        res.send(response.rows[0])
    }catch(error){

    }
})
app.put('/api/notes/:id',async(req,res,next)=>{
    try{
        const id = Number(req.params.id)
        const body = req.body
        const txt = body.txt
        const ranking =Number(body.ranking)
        const SQL = `
        UPDATE notes
        SET txt =$1, ranking =$2, updated_at=now()
        WHERE id =$3 RETURNING *;`
        const response = await client.query(SQL,[txt,ranking, id])
        res.send(response.rows)
    }catch(error){
        next(error)
    }
})
app.delete('/api/notes/:id',async(req,res,next)=>{
    try{
        const id = req.params.id
        const SQL = `
        DELETE FROM notes
        WHERE id = $1`
        const response = await client.query(SQL, [id])
        res.sendStatus(204)
    }catch(error){

    }
})


const init = async ()=>{
   await client.connect()
   console.log("Successly connected tot he database")
   const SQL = `
   DROP TABLE IF EXISTS notes;
   CREATE TABLE notes(
   id SERIAL PRIMARY KEY,
   created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
   );`
    await client.query(SQL)
    console.log('Successfully created tables')
    const SQLTwo = `
    INSERT INTO notes(txt, ranking) VALUES ('Javascript is fun!',5);
     INSERT INTO notes(txt, ranking) VALUES ('But backen is more fun!',4);
      INSERT INTO notes(txt, ranking) VALUES ('But none is as fun as front end!',2);`
    await client.query(SQLTwo)
    console.log('Successfully seeded database')
    app.listen(PORT,()=>{
        console.log('Your server is running!')
    })
}
init()