import { Request, Response } from 'express';
import axios from 'axios';

export const recommendationSearchList = async (req: Request, res: Response) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
    }

    const apiKey = process.env.GEOAPIFY_API_KEY;
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching data" });
    }
};
