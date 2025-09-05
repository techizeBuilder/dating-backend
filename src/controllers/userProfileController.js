import User from "../models/userModel.js";

export const setupProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = {
      name: req.body.name,
      email: req.body.email,
      country_code: req.body.country_code,
      i_am: req.body.i_am,
      interested_in: req.body.interested_in,
      age: req.body.age,
      about: req.body.about,
      likes: req.body.likes,
      interests: req.body.interests,
      hobbies: req.body.hobbies,
      skin_color: req.body.skin_color,
      height: req.body.height,
      weight: req.body.weight,
      address: req.body.address,
      category: req.body.category,
      marital_status: req.body.marital_status,
      profession: req.body.profession,
    };

    const updatedUser = await User.findByIdAndUpdate(userId, profileData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      profile: {
        _id: updatedUser._id,
        i_am: updatedUser.i_am,
        interested_in: updatedUser.interested_in,
        name: updatedUser.name,
        country_code: updatedUser.country_code,
        profession: updatedUser.profession,
        marital_status: updatedUser.marital_status,
        age: updatedUser.age,
        about: updatedUser.about,
        likes: updatedUser.likes,
        interests: updatedUser.interests,
        hobbies: updatedUser.hobbies,
        skin_color: updatedUser.skin_color,
        height: updatedUser.height,
        weight: updatedUser.weight,
        category: updatedUser.category,
        email: updatedUser.email,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

export const getMatches = async (req, res) => {
  try {
    const { age_min, age_max, city } = req.query;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const query = {
      _id: {
        $ne: req.user.id,
        $nin: [...user.likedUsers, ...user.blockedUsers],
      },
      status: "active",
      i_am:
        user.interested_in === "Both"
          ? { $in: ["Male", "Female", "Other"] }
          : user.interested_in,
      interested_in: { $in: [user.i_am, "Both"] },
      category: { $in: [user.category] },
    };

    if (age_min && age_max) {
      query.age = { $gte: parseInt(age_min), $lte: parseInt(age_max) };
    }

    if (city) {
      query["address.city"] = new RegExp(city, "i"); // <-- case insensitive city search
    }

    const matches = await User.find(query)
      .select("name age address profile_image about category")
      .limit(20)
      .lean();

    const formattedMatches = matches.map((match) => ({
      id: match._id,
      name: match.name,
      age: match.age,
      country: match.address?.country || "",
      city: match.address?.city || "",
      profile_image: match.profile_image,
      about: match.about,
      category: match.category,
    }));

    res.status(200).json({
      status: true,
      matches: formattedMatches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = {};

    // Fields that should be parsed from the request body directly
    const jsonFields = ["likes", "interests", "hobbies", "address"];

    jsonFields.forEach((key) => {
      if (req.body[key]) {
        updateData[key] = req.body[key]; // No need for JSON.parse
      }
    });

    // Handle all other plain fields
    const fields = [
      "name",
      "email",
      "mobile",
      "i_am",
      "country_code",
      "interested_in",
      "age",
      "about",
      "skin_color",
      "height",
      "weight",
      "profession",
      "marital_status",
      "category",
      "subscription",
      "status",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    console.log("req files to update profile image : ", req.files);

    // Handle file uploads if any
    if (req.files?.profile_image?.[0]) {
      const filename = req.files.profile_image[0].filename;
      updateData.profile_image = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${filename}`;
    }

    if (req.files?.banner_image?.[0]) {
      const filename = req.files.banner_image[0].filename;
      updateData.cover_image = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// Get User Details by ID
export const getUserDetails = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Fetch both users from DB
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId).lean().populate("interests"),
      User.findById(targetUserId).lean().populate("interests"),
    ]);

    if (!targetUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    let matchScore = 0;

    // Match criteria
    const genderMatch =
      currentUser.interested_in === "Both" ||
      currentUser.interested_in === targetUser.i_am;
    const reverseGenderMatch =
      targetUser.interested_in === "Both" ||
      targetUser.interested_in === currentUser.i_am;
    if (genderMatch && reverseGenderMatch) matchScore += 20;

    const sharedInterests = currentUser.interests?.filter((i) =>
      targetUser.interests?.some((t) => t._id.toString() === i._id.toString())
    );
    if (sharedInterests?.length > 0) matchScore += 20;

    const sharedHobbies = currentUser.hobbies?.filter((hobby) =>
      targetUser.hobbies?.includes(hobby)
    );
    if (sharedHobbies?.length > 0) matchScore += 20;

    if (
      currentUser.category &&
      targetUser.category &&
      currentUser.category === targetUser.category
    ) {
      matchScore += 20;
    }

    const currentCountry = currentUser.address?.country?.toLowerCase();
    const targetCountry = targetUser.address?.country?.toLowerCase();
    if (currentCountry && targetCountry && currentCountry === targetCountry) {
      matchScore += 20;
    }

    // Return target user with match score
    res.status(200).json({
      status: true,
      message: "User details fetched successfully",
      user: {
        id: targetUser._id,
        i_am: targetUser.i_am,
        name: targetUser.name,
        email: targetUser.email,
        age: targetUser.age,
        about: targetUser.about,
        interests: targetUser.interests,
        hobbies: targetUser.hobbies,
        profile_image: targetUser.profile_image,
        category: targetUser.category,
        address: targetUser.address,
        likes: targetUser.likes,
        skin_color: targetUser.skin_color,
        height: targetUser.height,
        weight: targetUser.weight,
        match_percentage: matchScore,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Like and matching controllers
export const likeUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userIdToLike } = req.body;

    if (currentUserId === userIdToLike) {
      return res.status(400).json({ message: "You cannot like yourself." });
    }

    const [user, userToLike] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userIdToLike),
    ]);

    if (!user || !userToLike) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update likedUsers if not already liked
    const alreadyLiked = user.likedUsers.includes(userIdToLike);
    if (!alreadyLiked) {
      user.likedUsers.push(userIdToLike);
      await user.save();
    }

    // Update likedBy for the other user if not already added
    const alreadyInLikedBy = userToLike.likedBy.includes(currentUserId);
    if (!alreadyInLikedBy) {
      userToLike.likedBy.push(currentUserId);
      await userToLike.save();
    }

    // Check for match (mutual like)
    const isMutual = userToLike.likedUsers.includes(currentUserId);

    res.status(200).json({
      message: isMutual ? "It's a match!" : "User liked successfully.",
      match: isMutual,
    });
  } catch (error) {
    console.error("likeUser error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const getAllMatchedUsers = async (req, res) => {
  console.log("hit getAllMatches");
  try {
    const currentUserId = req.user.id;

    // Get current user with interests and hobbies
    const currentUser = await User.findById(currentUserId)
      .populate("likedUsers interests")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find mutual likes
    const matchedUsers = await User.find({
      _id: { $in: currentUser.likedUsers.map((u) => u._id || u) },
      likedUsers: currentUserId,
    })
      .populate("address interests")
      .lean();

    // Format with match percentage
    const formattedMatches = matchedUsers.map((match) => {
      let matchScore = 0;

      // 1. Gender compatibility
      const genderMatch =
        currentUser.interested_in === "Both" ||
        currentUser.interested_in === match.i_am;
      const reverseGenderMatch =
        match.interested_in === "Both" ||
        match.interested_in === currentUser.i_am;
      if (genderMatch && reverseGenderMatch) matchScore += 20;

      // 2. Shared interests
      const sharedInterests = currentUser.interests?.filter((i) =>
        match.interests?.some((m) => m.toString() === i.toString())
      );
      if (sharedInterests?.length > 0) matchScore += 20;

      // 3. Shared hobbies
      const sharedHobbies = currentUser.hobbies?.filter((hobby) =>
        match.hobbies?.includes(hobby)
      );
      if (sharedHobbies?.length > 0) matchScore += 20;

      // 4. Same category
      if (
        currentUser.category &&
        match.category &&
        currentUser.category === match.category
      ) {
        matchScore += 20;
      }

      // 5. Same country
      const currentCountry = currentUser.address?.country?.toLowerCase();
      const matchCountry = match.address?.country?.toLowerCase();
      if (currentCountry && matchCountry && currentCountry === matchCountry) {
        matchScore += 20;
      }

      return {
        id: match._id,
        name: match.name,
        age: match.age,
        country: match.address?.country || "",
        city: match.address?.city || "",
        profile_image: match.profile_image,
        about: match.about,
        category: match.category,
        match_percentage: matchScore,
      };
    });

    res.status(200).json({
      matches: formattedMatches,
      count: formattedMatches.length,
    });
  } catch (error) {
    console.error("getAllMatchedUsers error:", error);
    res.status(500).json({ message: "Server error." });
  }
};
