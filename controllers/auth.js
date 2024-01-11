const User = require('../models/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const nodemailer = require("nodemailer")
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(sendgridTransport({
    auth :{
        api_key : process.env.SENDGRID_API_KEY // sendgrid api key
    }
}))


exports.getLogin =  (req,res,next) => {
    let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/auth/login',
        errorMessage : message})
}

exports.postLogin =  (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email : email}).then(user=>{
        if(!user){
            req.flash('error', 'invalid email')
            return res.redirect('/login');
        }
        bcrypt.compare(password, user.password)
        .then(doMatch =>{
            if(doMatch){
                req.session.user = new User(user.name, user.email, user.password,user.cart, user._id);
                req.session.isAuthenticated = true;
                req.session.save(err =>{
                    res.redirect('/')
                }) 
            }else{
                req.flash('error', 'invalid password')
                res.redirect('/login');
            }           
        }).catch(err=>{
            console.log(err);
            res.redirect('/login');
        })
    })
}

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err)
        res.redirect('/')
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message = null;
    }
    res.render('auth/signin',{pageTitle: 'Sign up',
    path: '/auth/signin',
    errorMessage : message})
}


exports.postSignup = (req, res, next) => {
    User.findOne({email : req.body.email})
    .then(userData => {
        if (userData){
            req.flash('error', 'email already exists, please user another')
            return res.redirect('/signup')
        }
        bcrypt.hash(req.body.password, 12)
        .then(hashedPassword =>{
            const user = new User(req.body.name, req.body.email, hashedPassword)
            return user.save();
        })
        .then(resp=>{
            res.redirect('/login')
            return transporter.sendMail({
                to: req.body.email,
                from : 'deepikapareek91@gmail.com',
                subject : 'signup success',
                html : '<p>You have signed up successfully.</p>'
            })
            
        }).catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
    
}

exports.getReset = (req,res,next) =>{
    let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message = null;
    }
    res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: '/auth/reset-password',
        errorMessage : message})
}

exports.postReset = (req,res,next) => {
    const email = req.body.email;
    User.findOne({email : email})
    .then(user => {
        if (!user){
            req.flash('error', 'user with this email not found')
            return res.redirect('/reset')
        }
        return crypto.randomBytes(32,(err,buffer) =>{
            if(err){
                console.log(err);
                return res.redirect('/reset')
            }
            const token = buffer.toString('hex')
            const newuser = new User(user.name, user.email, user.password, user.cart, user._id, token)
            console.log("token generated :::::",token)
            newuser.save();
            res.redirect('/reset')
            return transporter.sendMail({
                to: email,
                from : 'deepikapareek91@gmail.com',
                subject : 'password reset request',
                html : `
                <p>You requested password reset.</p>
                <p>Please click this <a href="${req.protocol}://${req.get('host')}/reset/${token}">link</a> to update your password.</p>
                `
            })
        })
        .then(result =>{
        })
    })
    .catch(err=>{
        console.log(err)
    })
}

exports.getUpdatePassword = (req,res,next) =>{
    console.log('req in get update pwd---',req.params)
    let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message = null;
    }
    User.findOne({
        $and : [
            {resetToken : req.params.token},
            {tokenExpiration : {$gt : Date.now()}}
        ]
    })
    .then(user => {
        if (!user){
            req.flash('error', 'Token expired. PLease try reset again')
            return res.redirect('/reset')
        }
        res.render('auth/update-password',{
            pageTitle: 'Reset Password',
            path: '/auth/update-password',
            errorMessage : message,
            userId : user._id.toString()
        })
    })
}

exports.postUpdatePassword = (req,res,next) =>{
    const newPassword = req.body.password;
    const userId = req.body.userId;
    User.findById(userId)
    .then(user =>{
        if (user){
            bcrypt.hash(newPassword, 12).then(hashedPassword =>{
                const newuser = new User(user.name, user.email, hashedPassword, user.cart, user._id, null)
                newuser.save();
                return res.redirect('/login')
            }).catch(err=>{
                console.log(err)
            })
        }
    })
    .catch(err =>{
        console.log(err)
    })
    
}