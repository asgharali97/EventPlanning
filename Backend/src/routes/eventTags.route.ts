import { addTagsToEvent, clearEventTags, getEventTags, removeTagsFromEvent, replaceEventTags } from "controllers/eventTags.controller.js";
import { Router } from "express";
import isHost from "middleware/isHost.js";
import verifyJWT from "middleware/jwtVerify.js";

const router = Router();

router.route('/addtags/:eventId').post(verifyJWT,isHost,addTagsToEvent);
router.route('/replaceTags/:eventId').patch(verifyJWT,isHost,replaceEventTags);
router.route('/removeTag/:eventId').patch(verifyJWT,isHost,removeTagsFromEvent)
router.route('/getTags/:eventId').get(verifyJWT,isHost,getEventTags);
router.route('/clearTags/:eventId').patch(verifyJWT,isHost,clearEventTags);

export default router;
