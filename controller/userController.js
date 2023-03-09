import UserModel from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from "../config/emailConfig.js";

class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirm, tc } = req.body;
        const user = await UserModel.findOne({ email: email });

        if (user) {
            res.send({ "status": "status Failed", "message": "user is already exists" });
        } else {
            if (name && email && password_confirm && tc) {
                if (password === password_confirm) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = await bcrypt.hash(password, salt);
                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc
                        });
                        await doc.save();
                        const saved_user = UserModel.findOne({ email: email })
                        //JwtToken creation

                        const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });

                        res.send({ "status": "success", "message": "Data is added to successfully", "token": token });
                    } catch (err) {
                        console.log(err);
                        res.send({ "status": "status Failed", "message": "unable to register" });
                    }

                } else {
                    res.send({ "status": "status Failed", "message": "password and confirm password is not matched" });
                }

            } else {
                res.send({ "status": "status Failed", "message": "All fields are required" });
            }
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email });
                if (user != null) {
                    const isMatch = bcrypt.compare(password, user.password);
                    if ((user.email === email) && isMatch) {
                        //JwtToken creation
                        const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });

                        res.send({ "status": "success", "message": "User Login!", "token": token });
                    } else {
                        res.send({ "status": "status Failed", "message": "Email or Password is not matched" });
                    }
                } else {
                    res.send({ "status": "status Failed", "message": "User is not Registered" });
                }
            } else {
                res.send({ "status": "status Failed", "message": "All fields are required" });
            }

        } catch (err) {
            console.log(err);
            res.send({ "status": "status Failed", "message": "Unable to login" });

        }
    }
    static changeUserPassword = async (req, res) => {
        const { password, password_confirm } = req.body;
        if (password && password_confirm) {
            if (password !== password_confirm) {
                res.send({ "status": "status Failed", "message": "password and confirm password is not match" });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(password, salt);
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: hashPassword } });
                res.send({ "status": "success", "message": "password changes successfully" });
            }
        } else {
            res.send({ "status": "status Failed", "message": "All fields are required" });
        }
    }
    static loggedUser = async (req, res) => {
        res.send({ "user": req.user });
    }
    static sendUserPasswordReset = async (req, res) => {
        const { email } = req.body;
        if (email) {
            const user = await UserModel.findOne({ email: email });

            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
                const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`

                //Send Email

                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "User-Password-Reset Link",
                    html: `<a href=${link}>Click Here</a>Reset your Password`
                })
                console.log(user.email);

                res.send({ "status": "success", "message": "Password reset Email sent... Please check you Email!", "info": info });

            } else {
                res.send({ "status": "status Failed", "message": "Email is not exist" });
            }
        } else {
            res.send({ "status": "status Failed", "message": "Email fields are required" });
        }
    }

    static userPasswordReset = async (req, res) => {
        const { password, password_confirm } = req.body;
        const { id, token } = req.params;
        const user = await UserModel.findById(id);
        const new_secret = user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, new_secret);
            if (password && password_confirm) {
                if (password === password_confirm) {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);
                    await UserModel.findByIdAndUpdate(user._id, { $set: { password: hashPassword } });
                    res.send({ "status": "success", "message": "password reset successfully" });
                } else {
                    res.send({ "status": "status Failed", "message": "password and confirm password is not matched" });
                }

            } else {
                res.send({ "status": "status Failed", "message": "All fields are required " });
            }
        } catch (err) {
            console.log(err);
            res.send({ "status": "status Failed", "message": "Invalid Token !" });
        }
    }


}

export default UserController;
