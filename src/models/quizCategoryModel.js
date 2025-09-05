import mongoose from 'mongoose';

const quizCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

const QuizCategory = mongoose.model('QuizCategory', quizCategorySchema);

export default QuizCategory;