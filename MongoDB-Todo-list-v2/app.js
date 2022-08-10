const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/todoListDB");

app.use(express.static("public"));

app.set("view engine", "ejs");

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    list: [itemSchema]
});

const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Buy food"
});

const item2 = new Item({
    name: "Cook food"
});

const item3 = new Item({
    name: "Eat food"
});


const today = new Date();
const options = {
    weekday: "long",
    day: "numeric",
    month: "long"
};

// const currentDay = today.toLocaleDateString("en-US", options);
const currentDay = "Today";


const defaultItems = [item1, item2, item3];

// Get Routes :

app.get("/", function (req, res) {

    Item.find(function (err, foundItems) {
        if (err) {
            console.log(err);
        } else {
            if (foundItems === []) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Inserted Default items");
                    }
                });
                setTimeout(() => {
                    res.redirect("/");
                }, 1000);
            } else {
                res.render("list", {
                    listTile: currentDay,
                    itemList: foundItems
                });
            }
        }
    });

});


app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
        name: customListName
    }, function (err, foundItem) {
        if (err) {
            consoe.log(err);
        } else {
            if (foundItem) {
                res.render("list", {
                    listTile: foundItem.name,
                    itemList: foundItem.list
                });

            } else {
                const newList = new List({
                    name: customListName,
                    list: defaultItems
                })
                newList.save();
                setTimeout(() => {
                    res.redirect('/' + customListName);
                }, 1000);
                // res.render("list", {
                //     listTile: newList.name,
                //     itemList: newList.list
                // });

            }
        }
    });


});


// Post routes :

app.post("/", function (req, res) {

    const newItemName = req.body.newItem;
    const listName = req.body.list;

    const newItem = new Item({
        name: newItemName
    });


    if (listName === currentDay) {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function (err, foundItem) {
            if (err) {
                console.log(err);
            } else {
                foundItem.list.push(newItem);
                foundItem.save();
                setTimeout(() => {
                    res.redirect("/" + listName);
                }, 1000);
                // res.render("list", {
                //     listTile: foundItem.name,
                //     itemList: foundItem.list
                // });
            }
        });
    }

});

app.post("/delete", function (req, res) {
    const itemId = req.body.checkBox;
    const listName = req.body.listName;

    if (listName === currentDay) {
        Item.deleteOne({
            _id: itemId
        }, function (err) {
            if (err) {
                console.log(err);
            } else {
                // console.log("Successfully Deleted");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                list: {
                    _id: itemId
                }
            }
        }, function (err, foundItem) {
            if (err) {
                console.log(err);
            } else {
                setTimeout(() => {
                    res.redirect("/" + listName);
                }, 1000);
            }
        });

    }


});




app.listen(3000, function () {
    console.log("Sever started at port 3000");
});