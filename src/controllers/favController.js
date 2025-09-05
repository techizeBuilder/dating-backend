import Favourite from "../models/favouriteUsers.js";

export const addToFavourites = async (req, res) => {
  const userId = req.user._id;
  const { favouriteUserId } = req.body;

  try {
    const fav = await Favourite.create({
      user: userId,
      favouriteUser: favouriteUserId,
    });

    res.status(201).json({
      success: true,
      message: "User added to favourites successfully",
      data: fav,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already added to favourites",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add user to favourites",
      error: error.message,
    });
  }
};

export const removeFromFavourites = async (req, res) => {
  const userId = req.user._id;
  const { favouriteUserId } = req.body;

  try {
    const removed = await Favourite.findOneAndDelete({
      user: userId,
      favouriteUser: favouriteUserId,
    });

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "User not found in favourites",
      });
    }

    res.status(200).json({
      success: true,
      message: "User removed from favourites successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove user from favourites",
      error: error.message,
    });
  }
};

export const getFavourites = async (req, res) => {
  const userId = req.user._id;

  try {
    const favourites = await Favourite.find({ user: userId }).populate(
      "favouriteUser",
      "-password -__v"
    );

    res.status(200).json({
      success: true,
      message: "Fetched favourite users successfully",
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch favourite users",
      error: error.message,
    });
  }
};
