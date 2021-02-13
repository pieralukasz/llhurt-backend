import * as Yup from 'yup'
import User from '@models/User'

const EmailConfirmSchema = Yup.object().shape({
    token: Yup.string().required(),
})

export default async (req, res, next) => {
    try {
        const { token } = req.body

        await EmailConfirmSchema.validate(req.body)

        console.log(token)

        const user = await User.findOne({
            emailConfirmCode: token,
            emailConfirmTrue: false,
        })

        console.log(user)

        if (!user) {
            return res.status(422).json({ message: 'Token is wrong' })
        }

        req.user = user

        return next()
    } catch (error) {
        return res.status(422).json({ message: 'error' })
    }
}
