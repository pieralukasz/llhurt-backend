import * as Yup from 'yup'
import User from '@models/User'

const RegisterSchema = Yup.object().shape({
    NIP: Yup.string().required(),

    email: Yup.string().email().required(),

    password: Yup.string().min(6).required(),
})

export default async (req, res, next) => {
    const { NIP, email, password } = req.body.user

    RegisterSchema.validate({ NIP, email, password }).catch((err) => {
        return res
            .status(422)
            .json({ message: 'The data provided is incorrect' })
    })

    const user = await User.findOne({ email })

    if (user) return res.status(422).json({ message: 'The user already exist' })

    return next()
}
