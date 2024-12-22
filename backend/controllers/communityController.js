// controllers/communityController.js
const Post = require("../models/Post");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

exports.createPost = async (req, res, next) => {
  try {
    const { content, type, tags } = req.body;

    const post = await Post.create({
      user: req.user.id,
      content,
      type,
      tags,
      media: req.files
        ? req.files.map((file) => ({
            type: "image",
            url: `/uploads/${file.filename}`,
          }))
        : [],
    });

    // Add points for creating a post
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "progress.points": 5 },
    });

    await post.populate("user", "name profileImage");

    res.status(201).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, tag } = req.query;
    const query = { visibility: "public" };

    if (type) query.type = type;
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name profileImage")
      .populate("workout", "type duration")
      .populate("progress", "metrics");

    const total = await Post.countDocuments(query);

    res.json({
      status: "success",
      data: {
        posts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      post.likes.push(req.user.id);
      // Add points for receiving a like
      await User.findByIdAndUpdate(post.user, {
        $inc: { "progress.points": 2 },
      });
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.json({
      status: "success",
      data: {
        likes: post.likes.length,
        isLiked: likeIndex === -1,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new AppError("Post not found", 404));
    }

    const comment = {
      user: req.user.id,
      content: req.body.content,
    };

    post.comments.push(comment);
    await post.save();

    // Add points for receiving a comment
    await User.findByIdAndUpdate(post.user, {
      $inc: { "progress.points": 3 },
    });

    await post.populate("comments.user", "name profileImage");

    res.status(201).json({
      status: "success",
      data: post.comments[post.comments.length - 1],
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!post) {
      return next(new AppError("Post not found or unauthorized", 404));
    }

    res.json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPostsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      user: userId,
      visibility: "public",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name profileImage")
      .populate("workout", "type duration")
      .populate("progress", "metrics");

    const total = await Post.countDocuments({
      user: userId,
      visibility: "public",
    });

    res.json({
      status: "success",
      data: {
        posts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    next(error);
  }
};
