const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.set("view engine", "ejs");

let items = ["Buy Food", "Cook food", "Eat food"];
let workItems = [];

app.get("/", function (req, res) {
    const today = new Date();
    const currentDay = today.getDay();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    res.render("list", {
        listTile: today.toLocaleDateString("en-US", options),
        itemList: items
    });


});

app.get("/work", function (req, res) {
    res.render("list", {
        listTile: "Work List",
        itemList: workItems
    });
})

app.post("/", function (req, res) {

    newItem = req.body.newItem;

    if (req.body.list === "Work") {

        workItems.push(newItem);
        res.redirect("/work");

    } else {

        items.push(newItem);
        res.redirect("/");
    }

});

app.get("/about",function(req,res){
    res.render("about");
});


app.listen(3000, function () {
    console.log("Sever started at port 3000");
});