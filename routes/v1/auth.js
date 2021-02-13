import { Router } from 'express'
import registerValidation from '@validators/register.js'
import loginValidation from '@validators/login.js'
import forgotPasswordValidation from '@validators/forgot-password.js'
import resetPasswordValidation from '@validators/reset-password.js'
import emailConfirmValidation from '@validators/email-confirm.js'
import authController from '@controllers/v1/auth.controller'
import verifyToken from '@validators/token'

const authRouter = new Router()

authRouter.get('/home', verifyToken, authController.token)

authRouter.get('/admin', verifyToken, authController.adminToken)

authRouter.post('/login', loginValidation, authController.login)

authRouter.post('/register', registerValidation, authController.register)

authRouter.post(
    '/password/email',
    forgotPasswordValidation,
    authController.forgotPassword
)

authRouter.post(
    '/password/reset',
    resetPasswordValidation,
    authController.resetPassword
)

authRouter.post(
    '/email/confirm',
    emailConfirmValidation,
    authController.confirmEmail
)

authRouter.post('/email/resend', authController.resendEmail)

export default authRouter
