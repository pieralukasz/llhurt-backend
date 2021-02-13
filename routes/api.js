import { Router } from 'express'

import authRouter from './v1/auth'

import fileRouter from './v2/file'

const v1Router = new Router()

const v2Router = new Router()

v1Router.use('/api/v1/auth', authRouter)

v2Router.use('/api/v2/file', fileRouter)

export default {
    v1Router,
    v2Router,
}
