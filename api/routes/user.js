const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

router.post("/signup", (req, res, next) => {
  User.find({
    $or: [{ username: req.body.username }, { email: req.body.email }]
  })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(422).json({
          message: "username/email already exists!!"
        });
      } else {
        bcrypt.hash(req.body.password, 12, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              username: req.body.username,
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log("result,", result);
                res.status(201).json({
                  message: "user created successfully"
                });
              })
              .catch(err => {
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    })
    .catch(err => {
      res.status(400).json({
        error: err
      });
    });
});

router.post("/login", (req, res, next) => {
  User.find({
    $or: [{ username: req.body.userOrEmail }, { email: req.body.userOrEmail }]
  })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "user credentials not valid"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "user credentials not valid"
          });
        }

        console.log(
          "process.env.JWT_PRIVATE_KEY ===",
          process.env.JWT_PRIVATE_KEY
        );

        if (result) {
          const authToken = jwt.sign(
            { userId: user[0]._id, email: user[0].email },
            process.env.JWT_PRIVATE_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "user authentication is successful",
            token: authToken
          });
        } else {
          return res.status(401).json({
            message: "user credentials not valid"
          });
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  const userId = req.params.userId;
  User.remove({ _id: userId })
    .then(result => {
      if (result.deletedCount === 1) {
        res.status(200).json({
          message: "user removed successfully"
        });
      } else {
        res.status(200).json({
          message: "No user exists with this id"
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
