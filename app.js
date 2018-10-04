const express = require('express');
const app = express();

app.use(express.json());

const courses =[
        {id: 1, name : 'java'},
        {id: 2, name : 'c#'},
        {id: 3, name : 'php'},
        {id: 4, name : 'ruby'}
];

app.get('/', (req, res) => {

    res.send('Welcome to get request');
});

app.get('/api/courses', (req, res) => {

    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {

    const course = courses.find( c => c.id === parseInt(req.params.id));
    if(!course){//404
        res.status(404).send('The course with given ID was not found');
    } else {
        res.status(200).send(course);
    }
    
});


app.post('/api/courses', (req, res) => {

    const course = {
            id: courses.length + 1,
            name: req.body.name
    };

    courses.push(course);
    res.send(course);
});





//PORT
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
