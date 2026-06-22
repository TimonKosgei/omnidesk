const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

const protect = async (req, res, next)=> {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({success:false, message:"Not authorized, token missing"})
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token,JWT_SECRET);

        req.user = decoded
        next()


    }catch(error){
        return res.status(401).json({success:false,message:"Not authorized, token invalid"})
    }
};

module.exports = protect;