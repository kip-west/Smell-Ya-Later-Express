const express = require('express');
const items = require('./items');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser')
require('dotenv').config()
const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

app.set('port', process.env.PORT || 1337)
app.locals.title = 'Smell Ya Later'
app.locals.items = items.items
app.locals.messages = []
client.messages.list()
    .then(messages => messages.forEach(m => app.locals.messages.push(m)))

app.get('/', (request, response) => {
    response.send(`Welcome to ${app.locals.title}`)
})

app.get('/api/v1/items', (request, response) => {
    const items = app.locals.items

    response.json({ items })
})

app.get('/api/v1/messages', (request, response) => {
    const messages = app.locals.messages

    response.json({ messages })
})

app.post('/api/v1/messages', (req, res) => {
    res.header('Content-Type', 'application/json')
    client.messages
        .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: req.body.to,
            body: req.body.body
        })
        .then(() => {
            res.send(JSON.stringify({ success: true }))
        })
        .catch(err => {
            console.log(err);
            res.send(JSON.stringify({ success: false }))
        })
})

app.post('/api/v1/sms', (request, response) => {
    const twiml = new MessagingResponse();

    const message = twiml.message('Thanks for your response!')
    console.log(message)

    response.writeHead(200, { 'Content-Type': 'text/xml' })
    response.end(twiml.toString());
})

app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on http://localhost:${app.get('port')}`)
});