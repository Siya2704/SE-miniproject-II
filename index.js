const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const express = require('express');
const app = express(); //instance of express
const path = require('path');
const alert = require('alert');
const util = require('util');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    user_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female"] },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    cart: { type: Array, default: [] },
    bought: { type: Array, default: [] },
    sold: { type: Array, default: [] }
});

const OlxSchema = new Schema({
    product_id: { type: String, required: true, unique: true },
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

Olx.find({}).then(data => console.log(data));
app.get('*', (req, res) => {
    res.render('home');
    // res.send("Invalid URL :(")
})
app.listen(3000, () => {
    console.log("Listening on port 3000");
})

// const seedDB = async () => {
//     await Olx.deleteMany({});   //delete everything from database
//     for (let i = 0; i < 50; i++) {
//         // const random1000 = Math.floor(Math.random() * 1000);
//         const price = Math.floor(Math.random() * 30) + 10;
//         const p = new Olx({
//             product_id: `${i}`,
//             product_name: "Samsung A50",
//             images: ['https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.samsung.com%2Fis%2Fimage%2Fsamsung%2Flatin-en-galaxy-a50-a505-sm-a505gzwjtpa-backwhite-156944251%3F%24720_576_PNG%24&imgrefurl=https%3A%2F%2Fwww.samsung.com%2Flatin_en%2Fsmartphones%2Fgalaxy-a%2Fsamsung-galaxy-a50-white-64gb-sm-a505gzwjtpa%2F&tbnid=ilMm0Kpt2SjexM&vet=12ahUKEwjbzID8xc_1AhUZ8jgGHSQlBCEQMygCegUIARDAAQ..i&docid=liDsz5pfQpujKM&w=720&h=576&itg=1&q=samsung%20a50&ved=2ahUKEwjbzID8xc_1AhUZ8jgGHSQlBCEQMygCegUIARDAAQ'],
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