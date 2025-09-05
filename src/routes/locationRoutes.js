import express from 'express';
import {
    getAllCountries,
    getStatesByCountry,
    getCitiesByState,
    getCityDetails,
    getAreasByPincode
} from '../controllers/locationController.js';

const router = express.Router();

router.get('/countries', getAllCountries);
router.post('/states', getStatesByCountry);
router.post('/cities', getCitiesByState);
router.post('/city/details', getCityDetails);
router.get('/areas/pincode/:pincode', getAreasByPincode);
export default router;