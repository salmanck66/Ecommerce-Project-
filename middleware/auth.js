const { logIn } = require('../controllers/admin');
const { verifyUser ,verifyAdmin} = require('../middleware/jwt');
const User = require('../models/users');

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
const authMiddlewareAdmin = async (req, res, next) => {
    try {
        console.log("calling Middleware");

        if (req.cookies.admin_jwt) {
            const tokenExracted = await verifyAdmin(req.cookies.admin_jwt);
            const CheckAdmin = await User.findById(tokenExracted.userId)
            console.log(CheckAdmin.isAdmin)
            
            if (CheckAdmin.isAdmin === true) {
                
                return next();
            }else
            {
            console.log("err1")
            return res.redirect('/admin');
            }
        }
        // If JWT token doesn't exist or user role is not 'user', redirect to login page
        res.redirect('/admin');
        
    } catch (error) {
        console.error("Error verifying admin:", error);
        res.redirect('/admin');
    }
};

const isAdmin = (req, res, next) => {
    // Check if user is authenticated
    if (req.isAuthenticated()) {
        // Check if user has admin privileges
        if (req.user && req.user.isAdmin) {
            // If user is authenticated and has admin privileges, allow access to admin routes
            return next();
        } else {
            // If user is not an admin, respond with unauthorized status
            return res.status(403).json({ error: "Unauthorized access. Admin privileges required." });
        }
    } else {
        // If user is not authenticated, redirect to login page or respond with unauthorized status
        return res.status(401).json({ error: "Unauthorized access. Please log in as an admin." });
    }
};

module.exports = { authMiddlewareAdmin,authMiddleware ,isAdmin};