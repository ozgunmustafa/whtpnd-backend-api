const Category = require('../models/Category');
const CustomError = require('../helpers/error/CustomError');
const asyncErrorWrapper = require('express-async-handler');
const User = require('../models/User');

const createCategory = asyncErrorWrapper(async (req, res, next) => {
  const formData = req.body;
  const category = await Category.create({
    ...formData,
  });
  res.status(200).json({
    success: true,
    message: 'Category created successfully!',
    data: category,
  });
});

const getAllCategories = asyncErrorWrapper(async (req, res, next) => {
  const categories = await Category.find();
  return res.status(200).json({
    success: true,
    data: categories,
  });
});

const getSingleCategory = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  return res.status(200).json({
    success: true,
    data: req.data,
  });
});
const getAllPostByCategory = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id)
    .populate({
      path: 'posts',
      populate: {
        path: 'category',
        select: 'title description createdAt',
        model: 'Category',
      },
    })
    .populate({
      path: 'posts',
      populate: {
        path: 'user',
        select: 'name profile_img about',
        model: 'User',
      },
    });

  return res.status(200).json({
    success: true,
    data: category,
  });
});
const followCategory = asyncErrorWrapper(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  const user = await User.findById(req.user.id);

  if (category.followers.includes(req.user.id)) {
    const categoryIndex = category.followers.indexOf(req.user.id);
    const userIndex = user.followingCategory.indexOf(id);

    category.followers.splice(categoryIndex, 1);
    user.followingCategory.splice(userIndex, 1);

    await category.save();
    await user.save();

    return res.status(200).json({
      message: 'Unfollowed',
      success: true,
      data: category,
    });
  }
  category.followers.push(req.user.id);
  user.followingCategory.push(id);
  await category.save();
  await user.save();
  return res.status(200).json({
    message: 'Followed 👍',
    success: true,
    //data: post,
  });
});

const getFeaturedCategories = asyncErrorWrapper(async (req, res, next) => {
  const featuredCategories = await Category.find({ isFeatured: true });

  return res.status(200).json({
    success: true,
    data: featuredCategories,
  });
});
const getPopularCategories = asyncErrorWrapper(async (req, res, next) => {
  const popularCategories = await Category.find({
    'posts.1': { $exists: true },
  });

  return res.status(200).json({
    success: true,
    data: popularCategories,
    length: popularCategories.length,
  });
});
module.exports = {
  createCategory,
  getSingleCategory,
  getAllCategories,
  getAllPostByCategory,
  followCategory,
  getFeaturedCategories,
  getPopularCategories,
};
