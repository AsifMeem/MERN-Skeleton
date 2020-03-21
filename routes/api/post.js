const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route    POST api/post
//@desc     Create a post
//@access   Private
router.post('/', [
    auth, 
    [
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ]
], 
async (req, res) => {
    const errors =  validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id);

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    

});

//@route    GET api/post
//@desc     Get all posts
//@access   Private

router.get('/', auth , async (req, res) => {
    try {
        //gets posts in ascending order , latest first => -1
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    GET api/post/:id
//@desc     Get a post by ID
//@access   Private

router.get('/:id', auth , async (req, res) => {
    try {
        //gets posts in ascending order , latest first => -1
        const post = await Post.findById(req.params.id);
        //For outputting proper error message if the post is not found for a valid object id
        if(!post){
            return res.status(404).json({ msg: 'Profile not found' });
        } 

        res.json(post);

    } catch (err) {
        //For outputting proper error message if the post is not found for an invalid object id
        if(err.kind == 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found' });
        } 
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/post/:id
//@desc     Delete a post
//@access   Private

router.delete('/:id', auth , async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);


        //Check user
        if (post.user.toString() != req.user.id){
            return res.status(401).json({ msg: 'User not authorized' });
        }

        
        //For outputting proper error message if the post is not found for a valid object id
        if(!post){
            return res.status(404).json({ msg: 'Post not found' });
        } 

        await post.remove();
        res.json({ msg: 'Post removed' });

    } catch (err) {
        //For outputting proper error message if the post is not found for an invalid object id
        if(err.kind == 'ObjectId'){
            return res.status(404).json({ msg: 'Post not found' });
        } 
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




module.exports = router;