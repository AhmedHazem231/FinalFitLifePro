// routes/community.js
const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.post("/posts", upload.array("media", 5), communityController.createPost);
router.get("/posts", communityController.getPosts);
router.get("/posts/:id", communityController.getPost);
router.delete("/posts/:id", communityController.deletePost);
router.post("/posts/:id/like", communityController.likePost);
router.post("/posts/:id/comment", communityController.addComment);
router.get("/users/:userId/posts", communityController.getPostsByUser);

module.exports = router;
