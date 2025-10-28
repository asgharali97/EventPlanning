import express, { Router } from "express";
import verifyJWT from "../middleware/jwtVerify.js";
import isHost from "../middleware/isHost.js";
import { getHostStats, getRecentEvents } from "../controllers/hostDashboard.controller.js";


const router = Router();
router.get('/',verifyJWT,isHost, (req,res)=>{
    console.log('this is host dashboard')
    res.send('hy this is dashboard')
});
router.get('/stats',verifyJWT,isHost, getHostStats);
router.get('/recent-events',verifyJWT,isHost, getRecentEvents);

export default router;