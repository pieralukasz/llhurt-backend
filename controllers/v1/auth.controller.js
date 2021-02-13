import User from '@models/User'
import PasswordReset from '@models/PasswordReset'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '@config/index'

const login = async (req, res) => {
    const { email, password } = req.body.user

    const user = await User.findOne({ email })

    if (user) {
        if (user.comparePasswords(password)) {

            let token = ''

            if (user.email === 'admin@e-szlafrok.pl') {

                token = user.generateAdminToken()

            } else {

                token = user.generateToken()

            }

            const { NIP, email, emailConfirmTrue } = user

            return res.status(201).json({ token, NIP, email, emailConfirmTrue })
        }
        return res.status(422).json({ message: 'Wrong Password' })
    }
    return res.status(422).json({ message: 'This user does not exist ' })
}

const register = async (req, res) => {
    let { NIP, email, password } = req.body.user

    const user = await User.create({
        NIP,
        email,
        password,
    }).then(console.log(`Uzytkownik ${email} zostal dodany do bazy`))

    return res.status(201).json({ email: user.email })
}

const forgotPassword = async (req, res) => {

    await req.user.forgotPassword(req.emailToken ? req.emailToken : false)

    return res.status(201).json({ message: 'Password reset link send' })
}

const resetPassword = async (req, res) => {
    const { user } = req

    let maybeUse = null

    const password = bcrypt.hashSync(req.body.password)

    await user.usedPassword.forEach((el) => {
        if (bcrypt.compareSync(req.body.password, el.lastPassword))
            maybeUse = true
    })

    if (maybeUse)
        return res.status(422).json({ message: 'Use another password' })

    await User.findOneAndUpdate(
        {
            email: user.email,
        },
        {
            password,
            $push: {
                usedPassword: { lastPassword: password, createdAt: new Date() },
            },
        }
    )

    await PasswordReset.findOneAndDelete({
        email: user.email,
    })

    return res.status(201).json({ message: 'Password Change!' })
}

const confirmEmail = async (req, res) => {
    await User.findOneAndUpdate(
        {
            email: req.user.email,
        },
        {
            emailConfirmTrue: true,
        },
        {
            new: true,
        }
    )

    return res.status(201).json({ message: 'Email Confirm!!' })
}

const token = async (req, res) => {
    jwt.verify(req.token, config.jwtSecret, (err) => {
        if (err) {
            jwt.verify(req.token, config.jwtSecretAdmin, (error) => {
                if (error) {
                    res.status(422).json({ message: 'Token is invalid...' })
                } else {
                    res.status(201).json({ message: 'Token Confirm!!' })
                }
            })
        } else {
            res.status(201).json({ message: 'Token Confirm!!' })
        }
    })
}

const adminToken = async (req, res) => {

    jwt.verify(req.token, config.jwtSecretAdmin, (err) => {
        if (err) {
            res.status(422).json({ message: 'Token is invalid...' })
        } else {
            res.status(201).json({ message: 'Token Confirm!!' })
        }
    })
}

const resendEmail = async (req, res) => {
    console.log(req.body.email)

    const user = await User.findOne({ email: req.body.email })

    console.log(user)

    // if(!req.user.emailConfirmTrue) {
    await user
        .sendEmail(user.email, user.NIP, user.emailConfirmCode)
        .then(() => res.status(201).json({ message: 'Email Sent!!' }))
}

export default {
    login,

    register,

    forgotPassword,

    resetPassword,

    confirmEmail,

    token,

    resendEmail,

    adminToken
}
