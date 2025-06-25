const {body} = require('express-validator');
const checkValidation = require('../middlewares/checkValidation');

const informationValidator = [
  body('full_name')
    .notEmpty().withMessage('Full name is required')
    .isAlpha('en-US', { ignore: ' ' }).withMessage('Full name must contain only letters and spaces'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email'),

  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone().withMessage('Enter a valid phone number'),

  body('avatar')
    .custom((value, { req }) => {
      if (!req.files || !req.files.avatar) {
        throw new Error('Avatar image is required');
      }
      return true;
    }),
  checkValidation  
  // You can also validate avatar here if needed
];

module.exports = informationValidator