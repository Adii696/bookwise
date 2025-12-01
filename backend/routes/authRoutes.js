import express from 'express';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
const r=express.Router();const t=i=>jwt.sign({id:i},process.env.JWT_SECRET,{expiresIn:'7d'});
r.post('/register',async(req,res)=>{const {name,email,password,role}=req.body;if(await User.findOne({email}))return res.status(400).json({message:'Email used'});const u=await User.create({name,email,password,role});res.json({_id:u._id,name:u.name,role:u.role,token:t(u._id)});});
r.post('/login',async(req,res)=>{const {email,password}=req.body;const u=await User.findOne({email});if(!u||!(await u.matchPassword(password)))return res.status(401).json({message:'Invalid'});res.json({_id:u._id,name:u.name,role:u.role,token:t(u._id)});});export default r;