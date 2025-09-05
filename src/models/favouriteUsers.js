import mongoose from "mongoose";

const favouriteUserSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    favouriteUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate favourites
favouriteUserSchema.index({ user: 1, favouriteUser: 1 }, { unique: true });

const Favourite = mongoose.model("Favourite", favouriteUserSchema);

export default Favourite;
