import { Router } from 'express'
import fileController from '@controllers/v2/file.controller'
import verifyBasket from '@validators/basket'
import verifyOrders from '@validators/orders'

const fileRouter = new Router()

fileRouter.post('/upload-image', fileController.uploadImage)

fileRouter.post('/delete-image', fileController.deleteImage)

fileRouter.get('/getxmlapi', fileController.getXmlApi)

fileRouter.get('/image/:id', fileController.sendImage)

fileRouter.post('/basket', verifyBasket, fileController.addBasket)

fileRouter.post('/orders', verifyOrders, fileController.orders)

fileRouter.post('/send-again', fileController.sendAgain)

export default fileRouter
