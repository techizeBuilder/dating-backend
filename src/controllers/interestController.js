import Interest from '../models/interestModel.js';

export const getAllInterests = async (req, res) => {
  try {
    const interests = await Interest.find()
      .populate('category_id', 'name')
      .lean();

    res.status(200).json({
      status: true,
      interests: interests.map(interest => ({
        id: interest._id,
        name: interest.name,
        color: interest.color,
        category: interest.category_id
          ? {
            id: interest.category_id._id,
            name: interest.category_id.name
          }
          : null, // <- safely handle missing category
        status: interest.status
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};