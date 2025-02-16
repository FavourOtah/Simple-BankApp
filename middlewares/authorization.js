import jwt from "jsonwebtoken";

const authorization = (req, res, next) => {
    //this body of code ensures that inly a logged in user is cleared to perform some actions

    //getting the token from a logged in user
    const { token } = req.cookies
    try {
        if (!token) {
            return res.status(400).json({ message: "Log in to continue" })
        };

        //verifying the token provided
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json({ message: "Invalid or expired token" })
            };

            //attaching the id from the token to req.user//extracting user id from the verified token
            req.user = payload.id


            next();
        })

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    };
}

export default authorization