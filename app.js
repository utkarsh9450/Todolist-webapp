//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-utkarsh:<test123>@cluster0.npeuq.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true} );

const itemsSchema={
  name:String,
};

const Item=mongoose.model("Item", itemsSchema);

const item1=new Item({
  name:"Welcome to your todolist"
});

const item2=new Item({
  name:"Hit the + button to add a new item."
});

const item3=new Item({
  name:"<---Hit this to delete an item"
});

const defaultItems=[item1, item2, item3];

const listSchema= {
  name: String,
  items: [itemsSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,founditems){
    if(founditems.length===0) {
      Item.insertMany(defaultItems,function(err){
        if(err)
        console.log(err);
        else{
          console.log("Successfully saved the default items to DATABASE.")
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle:"Today", newListItems: founditems});
    }
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item =new Item({
  name:itemName,
});

if(listName==="Today")
{
item.save();
res.redirect("/");
}else {
List.findOne({name:listName},function(err,foundlist){
  foundlist.items.push(item);
  foundlist.save();
  res.redirect("/"+listName);

});
}
});

app.post("/delete",function(req,res){
  const checkeditemid=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
  Item.findByIdAndRemove(checkeditemid,function(err){
    if(!err ){
       console.log("Successfully deleted checked item ");
        res.redirect("/");
    }
  });
}
  else {
    List.findOneAndUpdate({name:listName}, {$pull: {items:{_id:checkeditemid}}} , function(err,foundlist){
      if(!err){
        res.redirect("/"+listName);

      }
    })

  }
});


app.get("/:customlistname",function(req,res){
  const customListname = _.capitalize(req.params.customlistname);

List.findOne({name:customListname},function(err,foundlist){
  if(!err){
    if(!foundlist){
      //create a new list
      const list=new List({
        name:customListname,
        items:defaultItems,

      });
      list.save();
      res.redirect("/"+customListname);

    }
    else {
      //show an existing list
            res.render("list",{listTitle:foundlist.name,
            newListItems:foundlist.items
           })
          }
  }
});


});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
