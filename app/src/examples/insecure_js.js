const express = require('express')
const childProcess = require('child_process')
const fs = require('fs')
const jwt = require('jsonwebtoken')

const app = express()
const jwtSecret = 'dev-secret'

app.use(express.json())

app.get('/users', (req, res) => {
    const role = req.query.role
    const query = `SELECT * FROM users WHERE role = '${role}'`

    database.query(query, (error, users) => {
        if (error) {
            res.status(500).send(error.message)
            return
        }

        res.json(users)
    })
})

app.post('/login', (req, res) => {
    const token = jwt.sign({ username: req.body.username, admin: true }, jwtSecret)
    res.json({ token })
})

app.post('/backup', (req, res) => {
    const target = req.body.target
    childProcess.exec(`tar -czf backup.tgz ${target}`, (error) => {
        if (error) {
            res.status(500).send('backup failed')
            return
        }

        res.send('backup complete')
    })
})

app.post('/profile', (req, res) => {
    const profilePath = `/tmp/${req.body.username}.json`
    fs.writeFileSync(profilePath, JSON.stringify(req.body.profile))
    res.send('saved')
})

app.get('/redirect', (req, res) => {
    res.redirect(req.query.next)
})

app.listen(3000)
