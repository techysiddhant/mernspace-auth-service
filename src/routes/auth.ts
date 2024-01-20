import express, { RequestHandler } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);
router.post('/register', (async (req, res) => {
    await authController.register(req, res);
}) as RequestHandler);
export default router;
