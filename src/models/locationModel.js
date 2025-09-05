import mongoose from 'mongoose';

const countrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    }
});

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true
    }
});

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    }
});

const areaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    }
});

export const Country = mongoose.model('Country', countrySchema);
export const State = mongoose.model('State', stateSchema);
export const City = mongoose.model('City', citySchema);
export const Area = mongoose.model('Area', areaSchema);