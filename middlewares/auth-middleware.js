import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

var checkUserAuth = async (req, res, next) => {
    let token;
    //Get token from Header
    const { authorization } = req.headers;

    //here authorization is given in the header when client is login and their token is started with bearer
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1];
            //Verify Token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);


            //get user from token without password
            req.user = await UserModel.findById(userID).select('-password');
            next();
        } catch (err) {
            res.status(401).send({ "status": "status Failed", "message": "Unauthorized User!" });
        }

    }
    if (!token) {
        res.status(401).send({ "status": "status Failed", "message": "Unauthorized User! No token" });
    }
}
export default checkUserAuth;