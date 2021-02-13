import * as Yup from 'yup'
import User from '@models/User'
import PasswordReset from '@models/PasswordReset'

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email().required(),
})

export default async (req, res, next) => {
    try {
        const { email } = req.body

        await ForgotPasswordSchema.validate({ email })

        const user = await User.findOne({ email })

        if (!user) {
            
            return res.status(422).json({ message: 'There is no one heere' })
        }

        const existingReset = await PasswordReset.findOne({ email })

        if (existingReset) {

            req.emailToken = existingReset.token;
        }

        req.user = user

        return next()
    } catch (error) {
        return res.status(422).json({ message: 'Something goes wronggggg' })
    }
}
