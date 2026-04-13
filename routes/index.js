const express = require('express');
const router = express.Router();

router.get('/',function(req,res){
  res.redirect("/products");
});

router.get("/map/:orderId",function(req,res){
  res.render("map",{orderid:req.params.orderId});
});


module.exports = router;