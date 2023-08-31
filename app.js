//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://akylbek:101191@cluster0.fbqxbd9.mongodb.net/')
.then(() => console.log(`Connected to MongoDB`))
.catch((err) =>{
  console.error(`${err}`);
})

const itemSchema = {
  name : String,
}

const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
  name:"Welcome to your todolist!"
})
const item2 = new Item({
  name:"Hit the + button to add new items."
})
const item3 = new Item({
  name:"<----- Hit this to delete an item"
})

const defaultItems = [item1,item2,item3]



app.get("/", function(req, res) {



  Item.find({})
      .then(foundItems => {
        if(foundItems.length === 0){
          Item.insertMany(defaultItems)
          .then(() => console.log("Default Items added!"))
          .catch((err)=>console.error(`Error adding default items ${err}`))
          res.redirect("/")
        }else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }

    })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item = new Item({
    name:itemName
  })
  item.save()
  res.redirect("/"); 

});

app.post("/delete", function(req,res){
 const checkedItem = req.body.checkbox
 Item.findByIdAndRemove(checkedItem)
 .then (()=> res.redirect("/"));
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
