//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require('lodash')

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb+srv://akylbek:101191@cluster0.fbqxbd9.mongodb.net/")
  .then(() => console.log(`Connected to MongoDB`))
  .catch((err) => {
    console.error(`${err}`);
  });

const itemSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!",
});
const item2 = new Item({
  name: "Hit the + button to add new items.",
});
const item3 = new Item({
  name: "<----- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}).then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => console.log("Default Items added!"))
        .catch((err) => console.error(`Error adding default items ${err}`));
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({ name: customListName }).then((foundlist) => {
    if (!foundlist) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundlist.name,
        newListItems: foundlist.items,
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundlist) => {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemid = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemid).then(() => res.redirect("/"));
  }else {
    List.findOneAndUpdate({name: listName},{$pull:{items: {_id: checkedItemid}}})
    .then(() =>{
      res.redirect("/" + listName)
    })
  }
  
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started successfully ");
});
