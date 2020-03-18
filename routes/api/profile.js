const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile')

//@route    GET api/profile/me
//@desc     Get current users profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {
        //populating profile with name and avatar from user model using user id
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        );
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    POST api/profile
//@desc     Create or update user profile
//@access   Private
router.post(
    '/',
    [
        auth, //adding auth middleware
        [ //adding status and skill validations
            check('status', 'Status is required')
                .not()
                .isEmpty(),
            check('skills', 'Skills is required')
                .not()
                .isEmpty()
        ]
    ],
    async (req, res) => {
        try {
            //assigning the validation errors from above
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                company, website, location, bio, status, githubusername, skills, youtube,
                facebook, twitter, instagram, linkedin
            } = req.body;

            //Build profile object
            const profileFields = {};
            profileFields.user = req.user.id;
            if (company) profileFields.company = company;
            if (website) profileFields.website = website;
            if (location) profileFields.location = location;
            if (bio) profileFields.bio = bio;
            if (status) profileFields.status = status;
            if (githubusername) profileFields.githubusername = githubusername;
            if (skills) {
                profileFields.skills = skills.split(',').map(skill => skill.trim());
            }

            //Build social object
            profileFields.social = {}
            if (youtube) profileFields.social.youtube = youtube;
            if (twitter) profileFields.social.twitter = twitter;
            if (facebook) profileFields.social.facebook = facebook;
            if (linkedin) profileFields.social.linkedin = linkedin;
            if (instagram) profileFields.social.instagram = instagram;


            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                //Update profile
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile);
            }

            //Create profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);


        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }

    }
);

//@route    GET api/profile
//@desc     Get current users profile
//@access   Public

router.get('/', async (req, res) => {

    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});


//@route    GET api/profile/user/:user_id
//@desc     Get profile by user ID
//@access   Public

router.get('/user/:user_id', async (req, res) => {

    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']); //populate Profile model with User model info

        if (!profile)
            return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);

    } catch (err) {
        if(err.kind == 'ObjectId'){
            return res.status(400).json({ msg: 'Profile not found' });
        } 
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});

//@route    DELETE api/profile
//@desc     Delete profile , user and post
//@access   Private

router.delete('/', auth, async (req, res) => {

    try {
        //remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});

//@route    PUT api/profile/experience
//@desc     Add profile experience
//@access   Private

router.put('/experience', [ auth, [
    //Adding validations
    check('title', 'Title is required')
        .not()
        .isEmpty(),
    check('company', 'Company is required')
        .not()
        .isEmpty(),
    check('from', 'Start date is required')
        .not()
        .isEmpty()
    ] 
    ], async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array });
        }
        const {
            title, company, location, from, to, current, description
        } = req.body;

        const newExp = {
            title: title, //same as below, less syntax
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp); //unshift adds on top of object tree, First in. As opposed to push
            await profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }

});

//@route    DELETE api/profile/experience/:exp_id
//@desc     Delete experience from profile using id
//@access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Get index that is to be removed
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        //remove experience using id from profile
        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;