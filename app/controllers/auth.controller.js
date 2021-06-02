const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Tour = db.tour;
const Post = db.post

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");



// exports.getTour1 = (req, res) => {
//   Tour.findAll({where: {country: {[Op.eq]: "Turkey"}}}).then(tours => {
//     res.send(tours);
//   })
//   .catch(err => {
//     res.status(500).send(console.log(err));
//   });
// }


exports.getTour1 = (req, res) => {
  Tour.findAll({}).then(tours => {
    res.send(tours);
  })
  .catch(err => {
    res.status(500).send(console.log(err));
  });
}

exports.Posting = (req, res) => {
  Post.create({
    id: req.body.userId,
    body: req.body.body,
    title: req.body.title
  })
  .catch(err => {
    res.status(500).send(console.log(err));
  });
}



exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
