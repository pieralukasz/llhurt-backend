import jwt from 'jsonwebtoken'
import config from '../config/index'
import User from '@models/User'

export default async (req, res, next) => {

    const { token } = req.body.local

    const decoded = jwt.verify(token, config.jwtSecret)

    const user = await User.findOne({ _id: decoded.id })

    if(!user) return res.status(400).json({ message: 'Zmieniales cos...' })

    req.user = await user

    req.user_id = await user._id

    return next()
    
}
