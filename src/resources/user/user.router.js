import { Router } from "express";
import { authorization } from './user.controller';

const router = new Router();

router.post('/', authorization);

export default router;