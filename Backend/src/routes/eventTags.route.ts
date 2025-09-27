import { addTagsToEvent, clearEventTags, getEventTags, removeTagsFromEvent, replaceEventTags } from "controllers/eventTags.controller.js";
import { Router } from "express";
import isHost from "middleware/isHost.js";
import verifyJWT from "middleware/jwtVerify.js";

const router = Router();

router.route('/addtags/:eventId').post(verifyJWT,isHost,addTagsToEvent);
router.route('/replacetags/:eventId').patch(verifyJWT,isHost,replaceEventTags);
router.route('/removetag/:eventId').patch(verifyJWT,isHost,removeTagsFromEvent);
router.route('/gettags/:eventId').get(verifyJWT,isHost,getEventTags);
router.route('/cleartags/:eventId').patch(verifyJWT,isHost,clearEventTags);

export default router;
