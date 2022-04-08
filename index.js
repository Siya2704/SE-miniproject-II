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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const categories = [
    'Furniture',
    'Property',
    'Electronic',
    'Vehicles',
    'Decorative items',
    'Books, Sports',
    'Toys',
    'Fashion'
]

const UserSchema = new Schema({
    password: { type: String, required: true },
    user_name: { type: String, required: true },
    gender: { type: String },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Olx'
    }],
    bought: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Olx'
    }],
    sold: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Olx'
    }]
});

const OlxSchema = new Schema({
    product_name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: String, required: true },
    images: { type: String, required: true },
    description: { type: String, required: true },
    date: Date,
    owner: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
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
//             images: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoKHRvutao8XzBIXkatZ6hX48UQRcOMZyMvT7kVkaiEmUGI-pVuTYmxan_QKAgeFl2nrw&usqp=CAU',
//             description: '6GB RAM, 64GB storage, 25mpx camera',
//             price: price,
//             category: "Electronic",
//             date: Date(),
//             owner: "62501225a2e24a8c05cb822c"
//         });
//         await p.save();
//     }
// }
// seedDB().then(() => {
//     //  mongoose.connection.close();
// })

//Olx.find({}).then(data => console.log(data));


app.get('/olx', async (req, res) => {
    res.redirect(`/olx/login`);
})

app.get('/olx/home/:id', async (req, res) => {
    const { id } = req.params;
    const { category, product_name } = req.query;
    if (product_name) {
        const products = await Olx.find({ product_name });
        res.render('home', { products, category: "All", categories, id });
    }
    if (category) {
        const products = await Olx.find({ category });
        res.render('home', { products, category, categories, id });
    } else {
        const products = await Olx.find({});
        res.render('home', { products, category: "All", categories, id });
    }
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
        res.redirect(`/olx/home/${u._id}`);
    }
    else {
        alert("invalid login");
    }
})

app.get('/olx/add/:id', async (req, res) => {
    const { id } = req.params;
    res.render('add', { id, categories });
})

app.post('/olx/add', async (req, res) => {
    var i = req.body;
    var uname = i.name;
    var price = i.price;
    var catg = i.options;
    var img = i.image;
    var user_id = i.user_id;
    var date = Date();
    var description = i.description;

    var newU = { product_name: `${uname}`, category: `${catg}`, price: `${price}`, images: `${img}`, description: `${description}`, owner: `${user_id}`, date: `${date}` };
    await Olx.create(newU, async function (err, data) {
        if (err) console.log(err);
        else {
            const p = await User.findById(user_id);
            p.sold.push(data._id);
            await p.save();
            res.redirect(`/olx/${data._id}`);
        }
    });
})

app.get('/olx/profile/:id', async (req, res) => {
    const { id } = req.params;
    const p = await User.findById(id);
    const cart = p.cart;
    arr1 = [];
    arr2 = [];
    // console.log(cart);
    for (let i of cart) {
        if (i != null) {
            var c = await Olx.findById(i);
            arr1.push(c);
        }
    }
    // console.log(arr1);
    const sold = p.sold;
    for (let i of sold) {
        if (i != null) {
            var c = await Olx.findById(i);
            arr2.push(c);
        }
    }
    // console.log(arr2);
    // console.log(p);
    res.render('userProfile', { p, id, arr1, arr2, categories });
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
    res.render('./show', { p, date, id, categories });
})

app.get('/olx/cart/:pid/:uid', async (req, res) => {
    const { pid, uid } = req.params;
    const p = await User.findById(uid);
    if (p.cart.includes(pid) == false && p.sold.includes(pid) == false) {
        p.cart.push(pid);
    }
    await p.save();
    res.redirect(`/olx/home/${uid}`);
})

app.get('/olx/checkout/:id', async (req, res) => {
    const { id } = req.params;
    const p = await User.findById(id);
    const cart = p.cart;
    arr1 = [];
    var totalCost = 0;
    for (let i of cart) {
        if (i != null) {
            var c = await Olx.findById(i);
            if (c != null) {
                totalCost += parseInt(c.price);
                arr1.push(c);
            }
            await Olx.findOneAndDelete({ _id: c });
        }
    }
    res.render('./checkout', { p, arr1, totalCost, id, categories });
})

app.get('*', (req, res) => {
    res.send("Invalid URL :(");
})
app.listen(3000, () => {
    console.log("Listening on port 3000");
})