const { body, validationResult  } = require("express-validator");
const DB = require("../../config/postgres.config");

const postSeatsValidator = () => {
  return [
    body("name")
      .notEmpty()
      .isString()
      .withMessage("La valeur doit être une chaine de caractère.")
      .isLength({ max: 50 })
      .withMessage("La valeur ne doit pas dépasser 50 caractère.")
      .trim()
      .escape(),
      
    body("quality")
      .notEmpty()
      .isString()
      .withMessage("La valeur doit être une chaine de caractère.")
      .isLength({ max: 50 })
      .withMessage("La valeur ne doit pas dépasser 50 caractère.")
      .trim()
      .escape(),
  ];
};

const updateSeatsValidator = () => {
  return [
    body("name")
      .notEmpty()
      .isString()
      .withMessage("La valeur doit être une chaine de caractère.")
      .isLength({ max: 50 })
      .withMessage("La valeur ne doit pas dépasser 50 caractère.")
      .trim()
      .escape(),
      
    body("quality")
      .notEmpty()
      .isString()
      .withMessage("La valeur doit être une chaine de caractère.")
      .isLength({ max: 50 })
      .withMessage("La valeur ne doit pas dépasser 50 caractère.")
      .trim()
      .escape(),
  ];
};

async function validateSeats(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }

  module.exports= {postSeatsValidator, validateSeats, updateSeatsValidator}