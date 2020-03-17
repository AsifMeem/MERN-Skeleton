const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route    POST api/users
//@desc     Register user
//@access   Public

//creating router logic. First argument is the validations
router.post('/', [
    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password',
     'Please enter a password with 6 or more characters'
     ).isLength({min: 6})
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try{
        //looking for existing user

        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({ errors: [ {msg: 'User already exists' }] });
        }

        //creating avatar using gravatar

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        // creating user model

        user = new User({
            name,
            email,
            avatar,
            password
        });
        
        //password encryption

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //jwt token

        const payload = {
            user: {
                id: user.id //this id comes from the promise user.save()
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 36000 },
            ( err, token ) => {
                if (err) throw err;
                res.json( { token } );
            }
        );

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
}
);

module.exports = router;