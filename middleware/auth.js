const { verifyUser } = require('../middleware/jwt');

const authMiddleware = async (req, res, next) => {
    try {
        // Check if JWT token exists in cookies
        if (req.cookies.jwt) {
            const tokenExracted = await verifyUser(req.cookies.jwt);
            if (tokenExracted) {
                return next();
            }
        }
        // If JWT token doesn't exist or user role is not 'user', redirect to login page
        res.redirect('/login');
    } catch (error) {
        console.error("Error verifying user:", error);
        res.render('error', { print: error });
    }
};

module.exports = { authMiddleware };