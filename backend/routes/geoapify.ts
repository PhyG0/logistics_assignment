import express from 'express';
import { recommendationSearchList } from '../controllers/geoapify';
const geoapifyRouter = express.Router();

geoapifyRouter.get('/recommendation', recommendationSearchList);

export default geoapifyRouter;