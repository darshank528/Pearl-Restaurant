//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/pearlDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = mongoose.Schema({
  name: String,
  quantity: Number
});

const Item = mongoose.model("Item", itemsSchema);
const Order = mongoose.model("Order", itemsSchema);

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  res.render("home", {
    headingTitle: "Welcome to Pearl Restaurant!",
    headingPara: "A Crazy place for foodies - Heart of Perfect Food Hangout!"
  });
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    headingTitle: "Come talk to us!",
    headingPara: "We always value your words."
  });
});

app.get("/about", function(req, res) {
  res.render("about", {
    headingTitle: "Our story",
    headingPara: "About Pearl Restaurant"
  });
});

app.get("/cart", function(req, res) {
  Item.find({}, function(err, foundItems) {
    res.render("cart", {
      headingTitle: "Here is your Cart!",
      headingPara: "You're just one click away from fulfilling your craving.",
      listItems: foundItems
    });
  });
});

app.get("/place", function(req, res) {
  res.render("place", {
    headingTitle: "Choose a payment option.",
    headingPara: ""
  });
});

app.post("/add", function(req, res) {
  var quantity = req.body.quantity;
  var name = req.body.food;

  Item.findOne({
    name: name
  }, function(err, foundItem) {
    if (!err) {
      if (!foundItem) {
        const newItem = new Item({
          name: name,
          quantity: quantity
        });
        newItem.save();
      } else {
        foundItem.quantity = quantity;
        foundItem.save();
      }
    }
  });
});

app.post("/remove", function(req, res) {
  var item = req.body.removeItem;

  Item.findOneAndDelete({
    name: item
  }, function(err, deletedItem) {
    if (!err) {
      console.log("Deleted Item: " + deletedItem);
    }
  });
  res.redirect("/cart");
});

app.post("/ordered", function(req, res) {

  Item.find({}, function(err, foundItems) {
    Order.insertMany(foundItems, function(err) {
      console.log("Orders Created");
    });
  });

  Item.deleteMany({}, function(err) {
    if(!err){
      console.log("Cart emptied");
    }
  });
  var name = req.body.username;
  res.render("ordered", {
    name: name,
    orderID: Math.floor((Math.random() * 100000) + 1)
  });
});

app.post("/admin", function(req, res) {
  const username = req.body.user;
  const password = req.body.pass;
  if(username === "admin" && password === "admin123"){

    Order.find({}, function(err, foundItems) {
      res.render("admin", {
        headingTitle: "Welcome, Admin!",
        headingPara: "Here are all the orders placed.",
        listItems: foundItems
      });
    });
  }
  else {
    res.redirect("login");
  }
});

app.post("/deliver", function(req, res) {
  var item = req.body.removeItem;

  Order.findByIdAndDelete(item, function(err, deletedItem) {
    if (!err) {
      console.log("Deleted Item: " + deletedItem);
      Order.find({}, function(err, foundItems) {
        res.render("admin", {
          headingTitle: "Welcome, Admin!",
          headingPara: "Here are all the orders placed.",
          listItems: foundItems
        });
      });
    }
  });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000.");
});
