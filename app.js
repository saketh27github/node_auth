import express from 'express';
const router = express.Router();
import UserController from '../controller/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

//public Routes
// router.use('/changepassword', checkUserAuth);

router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordReset);
router.post('/reset/password/:id/:token', UserController.userPasswordReset);


//protected Routes

router.post('/changepassword', checkUserAuth, UserController.changeUserPassword);
router.get('/loggeduser', checkUserAuth, UserController.loggedUser);



export default router;