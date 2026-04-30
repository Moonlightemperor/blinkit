const jwt = require("jsonwebtoken");

require("dotenv").config();

function validateAdmin(req, res, next) {
  try {
    let token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    let data = jwt.verify(token, process.env.JWT_KEY);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
}

function userIsLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // For API requests, return JSON
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication required" 
    });
  }
  
  // For web requests, redirect to login
  return res.redirect("/users/login");
}

module.exports = { validateAdmin, userIsLoggedIn };