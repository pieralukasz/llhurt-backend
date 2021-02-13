import * as Yup from 'yup'
import User from '@models/User'
import PasswordReset from '@models/PasswordReset'

const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string().min(6).required(),
})

export default async (req, res, next) => {
    const { password, token } = req.body

    ResetPasswordSchema.validate({ password })

    const existingReset = await PasswordReset.findOne({ token })

    if (!existingReset) {
        return res.status(422).json({ message: 'You cant change password' })
    }

    const timeInMinutes = Math.ceil(
        (new Date().getTime() - new Date(existingReset.createdAt).getTime()) /
            60000
    )

    if (timeInMinutes > 5) {
        await PasswordReset.findOneAndDelete({ token })

        return res.status(422).json({ message: 'Reset token expired!' })
    }

    const user = await User.findOne({ email: existingReset.email })

    req.user = user

    return next()
}
