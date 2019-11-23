const router = require('express').Router();
const express = require('express');
const app = express();
const User = require('../model/User');
const {registerValidation, loginValidation} = require('./validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



app.set('view engine','ejs');


router.post('/',async (req,res)=>{
    const {error} = registerValidation(req.body);
    // if(error) return res.status(400).send(error.details[0].message);
    if(error) { 
    req.session.message = {
        class: 'active',
        message: `${error.details[0].message}`
        }
        res.redirect('/');
    };
    
    const nameExist = await User.findOne({name: req.body.name});
    // if(nameExist) return res.status(400).send('Name Already Exist');
    if(nameExist) { 
        req.session.message = {
            class: 'active',
            message: 'Name Already Exist !'
            }
            res.redirect('/');
        }

    const emailExist = await User.findOne({email: req.body.email});
    // if(emailExist) return res.status(400).send('Email Already Exist');
    if(emailExist) { 
        req.session.message = {
            class: 'active',
            message: 'Email Already Exist !'
            }
            res.redirect('/');
        }


    if(req.body.password !== req.body.confirm_password) { 
        // return res.status(400).send('Passwords doesnot match');
        req.session.message = {
            class: 'active',
            message: 'Passwords doesnot match !'
            }
            res.redirect('/');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })

    try{
        const savedUser = await user.save();
        // res.send('registered successfully');
        if(savedUser){ 
        req.session.message = {
            class: 'active',
            message: 'registered successfully !'
            }
            res.redirect('/');
        }
    }
    catch(err){
        // res.status(400).send(err);
        req.session.message = {
            class: 'active',
            message: `${err}`
            }
            res.redirect('/');

    }

});

router.post('/login',async (req,res)=>{
    const {error} = loginValidation(req.body);
    // if(error) return res.status(400).send(error.details[0].message);
    if(error){ 
    req.session.message = {
        class: 'active',
        message: `${error.details[0].message}`
        }
        res.redirect('/login');
    }

    const user = await User.findOne({email: req.body.email});
    // if(!user) return res.status(400).send('Email does not exist');
    if(!user){ 
        req.session.message = {
            class: 'active',
            message: 'Email does not exist !'
            }
            res.redirect('/login');
        }
    const validPass = await bcrypt.compare(req.body.password,user.password);
    // if(!validPass) return res.status(400).send('Invaid Password');
    if(!validPass){ 
        req.session.message = {
            class: 'active',
            message: 'Invaid Password !'
            }
            res.redirect('/login');
        }


    const token = jwt.sign({_id: user._id},process.env.TOKEN_SECRET);
    // console.log('yes');
    // req.flash('username',`${user.name}`);
    // res.locals.redirect = "/user-login";
    // res.locals.user = user;
    // res.redirect('/user-login');
    // console.log('no');
req.session.message = {
    username: `${user.name}`
}
res.redirect('/user-login');

});


module.exports = router;