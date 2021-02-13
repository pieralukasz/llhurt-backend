import * as Yup from 'yup'

const LoginSchema = Yup.object().shape({
    email: Yup.string().email().required(),

    password: Yup.string().min(6).required(),
})

export default async (req, res, next) => {
    const { email, password } = req.body.user

    await LoginSchema.validate({ email, password }).catch((err) => {
        return res
            .status(422)
            .json({ message: 'The validation is not correct' })
    })

    return next()
}
