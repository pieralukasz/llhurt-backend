import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import randomstring from 'randomstring'
import config from '../config/index'
import PasswordReset from './PasswordReset'
import pug from 'pug'
import mailer from '@config/mailer'

const render = (filename, data) => {
    return pug.renderFile(`${__dirname}/../template-mails/${filename}.pug`, data)
}

const UserSchema = new mongoose.Schema({
    NIP: Number,

    email: String,

    password: String,

    emailConfirmCode: String,

    emailConfirmTrue: Boolean,

    usedPassword: [Object],

    createdAt: Date,
})

UserSchema.pre('save', async function () {
    this.password = await bcrypt.hashSync(this.password)
    this.emailConfirmCode = await randomstring.generate(72)
    this.createdAt = await new Date()
    this.emailConfirmTrue =  await false

    this.usedPassword.push({
        lastPassword: this.password,
        createdAt: this.createdAt,
    })
})

UserSchema.post('save', async function () {

    const emailConfirm = {
        from: '<firma@e-szlafrok.com>',
        to: this.email,
        subject: `Potwierdzenie maila LL-HURT`,
        html: render('confirmAccount', {token: `http://menavio.com/auth/signup/confirm/${this.emailConfirmCode}`})
    }

    mailer.messages().send(emailConfirm, function(error, body) {
        console.log(body);
    })

})

UserSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id }, config.jwtSecret)
}

UserSchema.methods.generateAdminToken = function () {
    return jwt.sign({ id: this._id }, config.jwtSecretAdmin)
}

UserSchema.methods.sendEmail = async function (email, NIP, emailConfirmCode) {

    const emailConfirm = {
        from: '<firma@e-szlafrok.com>',
        to: this.email,
        subject: `Potwierdzenie maila LL-HURT`,
        html: render('confirmAccount', {token: `http://e-szlafrok.pl/auth/signup/confirm/${this.emailConfirmCode}`})
    }

    mailer.messages().send(emailConfirm, function(error, body) {
        console.log(body);
    })

}

UserSchema.methods.comparePasswords = function (plainPassword) {
    return bcrypt.compareSync(plainPassword, this.password)
}

UserSchema.methods.forgotPassword = async function (tokenGiven) {

    let token = null

    if (!tokenGiven) {

        token = randomstring.generate(72)

        await PasswordReset.create({
            token,

            email: this.email,

            createdAt: new Date(),
        })

    } else {

        token = tokenGiven
    }


    const resetPassword = {
        from: '<firma@menavio.com>',
        to: this.email,
        subject: `Reset hasla LL-HURT`,
        html: render('resetPassword', {token: `http://e-szlafrok.pl/auth/reminder/password/${token}`})
    }

    mailer.messages().send(resetPassword, function(error, body) {
        console.log(body);
    })

}

export default mongoose.model('User', UserSchema)
