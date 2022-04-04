const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const express = require('express');
const app = express(); //instance of express
const path = require('path');
// const alert = require('alert');
// const util = require('util');
const ejsMate = require('ejs-mate');
const alert = require('alert');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(express.json());

const category = [
    'Furniture',
    'Property',
    'Electronic appliances',
    'Vehicles',
    'Decorative items',
    'Books, Sports',
    'Toys',
    'Fashion'
]

const UserSchema = new Schema({
    // user_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_name: { type: String, required: true },
    gender: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    cart: { type: Array, default: [] },
    bought: { type: Array, default: [] },
    sold: { type: Array, default: [] }
});

const OlxSchema = new Schema({
    // product_id: { type: String, required: true, unique: true },
    product_name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    images: { type: Array, required: true },
    description: { type: String, required: true },
    date: Date,
    owner: { type: String, required: true },//user_id
});

const Olx = new mongoose.model('Olx', OlxSchema);
const User = new mongoose.model('User', UserSchema);


mongoose.connect('mongodb://localhost:27017/olx', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// const seedDB = async () => {
//     await Olx.deleteMany({});   //delete everything from database
//     for (let i = 1; i <= 50; i++) {
//         // const random1000 = Math.floor(Math.random() * 1000);
//         const price = Math.floor(Math.random() * 30) + 10;
//         const p = new Olx({
//             product_name: "Samsung A50",
//             images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoKHRvutao8XzBIXkatZ6hX48UQRcOMZyMvT7kVkaiEmUGI-pVuTYmxan_QKAgeFl2nrw&usqp=CAU'],
//             description: '6GB RAM, 64GB storage, 25mpx camera',
//             price: price,
//             category: "Electronic",
//             date: Date(),
//             owner: "1"
//         });
//         await p.save();
//     }
// }
// seedDB().then(() => {
//     mongoose.connection.close();
// })

// Olx.find({}).then(data => console.log(data));

app.get('/olx', async (req, res) => {
    const products = await Olx.find({});
    res.render('home', { products });
})

app.get('/olx/login', (req, res) => {
    res.render('login');
})

app.get('/olx/register', (req, res) => {
    res.render('register');
})

app.post('/olx/login', async (req, res) => {
    var i = req.body;
    var id = i.email;
    var pass = i.password;
    const u = await User.findOne({ email: `${id}`, password: `${pass}` });
    // console.log(u);
    if (u != null) {
        res.redirect(`/olx`);
    }
    else {
        alert("invalid login");
    }
})

app.post('/olx/register', async (req, res) => {
    var i = req.body;
    var uname = i.user_name;
    var email = i.email;
    var pass = i.password;
    var g = i.gender;
    var cont = i.phone;
    var add = i.address;

    var newU = { user_name: `${uname}`, email: `${email}`, password: `${pass}`, gender: `${g}`, phone: `${cont}`, address: `${add}` };
    await User.create(newU, function (err, data) {
        if (err) alert('Already registered email');
        else res.redirect(`/olx/login`);
    });
})

// convert date
function convert(str) {
    var date = new Date(str),
        mnth = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join("-");
}

app.get('/olx/:id', async (req, res) => {
    const { id } = req.params;
    const p = await Olx.findById(id);
    const date = convert(p.date);
    res.render('./show', { p, date });
})

app.get('*', (req, res) => {
    res.send("Invalid URL :(");
})
app.listen(3000, () => {
    console.log("Listening on port 3000");
})