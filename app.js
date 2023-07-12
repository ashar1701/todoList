
const bodyParser = require("body-parser");
const express=require("express");
const mongoose=require("mongoose");
const date=require(__dirname+"/date.js");
const app=express();
const _=require("lodash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))
mongoose.connect("mongodb+srv://armaansharma1701:T3M1N4TOR@cluster0.a5szzkn.mongodb.net/todolistDB",{useNewUrlParser:true})

app.set('view engine', 'ejs');   //initializing ejs
const itemsSchema=new mongoose.Schema({
    name:String
})

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your Custom to do List!"
})

const item2=new Item({
    name:"Hit + to add an item"
})

const item3=new Item({
    name:"Tick the checkbox to delete an item"
})

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemsSchema],         //items consist of a list of itemSchema elements, which have the layout of every item element

}
const List=mongoose.model("List",listSchema);

app.get("/",function(req,res){
    
     //let today=date();
     /*items are found and checked if the length of the items list is 0. If items list is empty, then default items are added using
     insertMany method and the you get redirected to the home route. If items list is not empty then the res.render takes place*/
     Item.find({}).exec()
     .then((items) => {
        if (items.length===0){
            Item.insertMany(defaultItems)
            res.redirect("/");
        }
        else{
            res.render("list",{ListTitle:"Today",newListItems:items});    //"list" is name of ejs file
        }
    })
      .catch((error) => {
        console.error(error);
      });
    
})

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);              //this allows us to get the name of any route the user enters after localhost:3000/""
    //lodash .capitalize is used to capitalize the first letter so that it the route becomes case insensitive
    /*to find if the name of the route(eg: /home) exists in the database. If it does then we just render the ejs file using the name
    of the 'found' route as the title and the default items in the list as found.items*/ 
    List.findOne({name:customListName})
    .then((found) => {
        if (!found){
            const list=new List({
                name:customListName,
                items:defaultItems   //array of items is the same as default items for our new route
            })
            list.save();
            res.redirect("/"+customListName);  //redirects to the customListName route after saving the data
        }else{
            res.render("list",{ListTitle:found.name,newListItems:found.items}); 
        }
      })
      .catch((err) => {
        console.log("Doesn't Exist")
      });
    
})



app.post("/",function(req,res){
    //adding new items
    const listName=req.body.list;   //this line is required to know which route the plus button has been clicked
    const itemName=req.body.NewItem;
    const item=new Item({
        name:itemName
    })

    //if the plus button clicked belongs to the home route then item is saved and updated in the home route
    if(listName==="Today"){
        item.save()                   //post request to add another item is handled by saving the new item to the database
                                //and redirecting to the home route.
        res.redirect("/");
    //if button is clicked from a custom list then the list name is found and  we add the this item to the new items in that list and redirect back
    }else{
        List.findOne({name:listName})
        .then((found)=>{
            found.items.push(item);
            found.save();
            res.redirect("/"+listName);
        })

    }
        /* at this step, after the post request is made, the server redirects to the home route
                                where it encounters a get request and  renders the ejs file in the app.get method*/
    
})

app.post("/delete",function(req,res){
    const checkedItemId=req.body.check;
    const listName=req.body.listName;

    if (listName==="Today"){
        console.log("successfully deleted");
        res.redirect("/"); 
    }else{                           
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},{new:true})   //$pull is a mongoDB method to remove data from a field (items)that match the query(id)
        .then((found)=>{
            res.redirect("/"+listName)
        })
        .catch((err)=>{
            console.log(err);
        })
    }
    Item.findOneAndDelete({ _id: checkedItemId })    //finding an by id and deleting it
  .then((deletedItem) => {
    if (deletedItem) {
      console.log("successfully deleted");
      res.redirect("/");       //after deleting from the database, you redirect to the home route for it to check through the db items again and display them
    }
  })
  .catch((error) => {
    // Handle the error
    console.error(error);
  });

})

let port=process.env.PORT;
if (port==null|| port==""){
    port=3000;
}

app.listen(port,function(){
    console.log("server is up and running");
})