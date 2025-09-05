import fetch from 'node-fetch';
import { Country, State, City, Area } from '../models/locationModel.js';

const API_BASE_URL = 'https://countriesnow.space/api/v0.1';

export const getAllCountries = async (req, res) => {
    try {
        const response = await fetch(`${API_BASE_URL}/countries`);
        const data = await response.json();

        if (data.error) {
            return res.status(400).json({
                status: false,
                message: data.msg
            });
        }

        const formattedCountries = data.data.map(country => ({
            name: country.country,
            iso2: country.iso2,
            iso3: country.iso3,
            cities: country.cities
        }));

        res.status(200).json({
            status: true,
            data: formattedCountries
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getStatesByCountry = async (req, res) => {
    try {
        const { country } = req.body;

        const response = await fetch(`${API_BASE_URL}/countries/states`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ country })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({
                status: false,
                message: data.msg
            });
        }

        const formattedStates = data.data.states.map(state => ({
            name: state.name,
            state_code: state.state_code
        }));

        res.status(200).json({
            status: true,
            data: formattedStates
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getCitiesByState = async (req, res) => {
    try {
        const { country, state } = req.body;

        const response = await fetch(`${API_BASE_URL}/countries/state/cities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ country, state })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({
                status: false,
                message: data.msg
            });
        }

        res.status(200).json({
            status: true,
            data: data.data
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};

export const getCityDetails = async (req, res) => {
    try {
        const { country, state, city } = req.body;

        // First get city details
        const cityResponse = await fetch(`${API_BASE_URL}/countries/population/cities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ city })
        });

        const cityData = await cityResponse.json();

        // Get city location data
        const locationResponse = await fetch(`${API_BASE_URL}/countries/positions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ country })
        });

        const locationData = await locationResponse.json();

        const cityDetails = {
            name: city,
            state: state,
            country: country,
            population: cityData.error ? 'Not available' : cityData.data.populationCounts[0]?.value,
            location: locationData.error ? {} : {
                latitude: locationData.data.lat,
                longitude: locationData.data.long
            }
        };

        res.status(200).json({
            status: true,
            data: cityDetails
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};



export const getAreasByPincode = async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!pincode || pincode.length !== 6) {
            return res.status(400).json({
                status: false,
                message: "Please provide a valid 6-digit pincode"
            });
        }

        const response = await fetch(`${INDIA_POST_API}${pincode}`);
        const data = await response.json();

        if (!data || data[0].Status === 'Error') {
            return res.status(404).json({
                status: false,
                message: "No data found for this pincode"
            });
        }

        const postOffices = data[0].PostOffice;
        if (!postOffices) {
            return res.status(404).json({
                status: false,
                message: "No areas found for this pincode"
            });
        }

        const formattedAreas = postOffices.map(office => ({
            area_name: office.Name,
            pincode: office.Pincode,
            division: office.Division,
            district: office.District,
            state: office.State,
            country: office.Country,
            details: {
                branch_type: office.BranchType,
                delivery_status: office.DeliveryStatus,
                circle: office.Circle
            }
        }));

        res.status(200).json({
            status: true,
            data: formattedAreas
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
};