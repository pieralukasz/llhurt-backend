import multer from 'multer'
import fetch from 'node-fetch'
import path from 'path'
import xml2js from 'xml2js'
import Basket from '@models/Basket'
import User from '@models/User'
import pug from 'pug'
import mailer from '@config/mailer'
import * as excel from '../../excel/index'
import fs from 'fs'
// import sgMail from '@sendgrid/mail'

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const upload = multer({ dest: __dirname + 'uploads/' })


const render = (filename, data) => {
    return pug.renderFile(`${__dirname}/../../template-mails/${filename}.pug`, data)
}

// Upload test


// Send JSON good file

const getXmlApi = async (req, res) => {
    const parseString = xml2js.parseString
    let xmlData = null

    await fetch('http://magazyn.szlafroki.com/csv/ArkuszZamowien.xml')
        .then((res) => res.text())
        .then((res) => (xmlData = res))

    parseString(xmlData, function (err, result) {
        xmlData = result.Zamówienie.Artykuly[0].Artykuł
    })

    return res.status(201).json(xmlData)
}

//Send all images

const sendImage = async (req, res, next) => {

    const options = {
        root: 'uploads',
        dotfiles: 'deny',
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      }

    const id = req.params.id

    
    res.sendFile(id, options, (err) => {
        if (err) {
            res.sendFile('nophoto.png', options, (err) => {
                next(err)
                console.log(id);
            })
          } else {
            console.log('Sent: ', id)
          }
    })

}

const addBasket = async (req, res) => {

    const { user_id, user } = req

    const { basket, message } = req.body

    console.log(req.body);

    const basketData = await Basket.create({

        user_id,

        basketItems: basket,

        message

    }).then(console.log('Zamowienie zostalo dodane do bazy'))

    const reqBody = {
        body: basketData
    }

    await sendAgain(reqBody)

    res.json({ basketData }) 

}


const orders = async (req, res) => {

    const { user_id } = req 

    const basket = await Basket.find({user_id})

    if(!basket) res.json(null)

    res.json({ basket })

}

const uploadImage = (req, res) => {

    console.log(req.files.image)
    console.log(req.body.name)


    req.files.image.mv( `uploads/` + req.body.name + '.png', function (err){
        if (err) {
            res.send(err)
        } else {
            res.send('file uploaded')
        }
    })

}

const deleteImage = (req, res) => {

    console.log(req.body)

    const oldPath = 'uploads/' + req.body.date + '.png'
    const newPath = 'deleteUploads/' + req.body.date + '.png'


    fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
        console.log('Successfully renamed - AKA moved!')
    })

    res.send({oldPath, newPath})

}

const sendAgain = async (req, res) => {


    const { order_id, user_id } = req.body

    const basketFind = await Basket.findOne({order_id})

    const user = await User.findOne({_id: user_id})

    excel.makeFile(basketFind.basketItems, user, basketFind.message)

    let basket = []
    for (const item of basketFind.basketItems) {
        basket.unshift(`${item.name} / ${item.size} / ${item.color} / ${item.ean} / ${item.quantity}`)
    }

    const data = {
        NIP: user.NIP,
        email: user.email,
        order_id: order_id,
        createdAt: basketFind.createdAt,
        basketItems: basket,
    }

    setTimeout(() => {

        const orderPath = path.join(__dirname, '../../excel/order.xlsx')

        const attachment = new mailer.Attachment({data: orderPath, filename: `zamowienie-${order_id.toUpperCase()}.xlsx`})

        const emailOptionsToClient = {
            from: '<firma@e-szlafrok.com>',
            to: user.email,
            subject: 'Zamowienie Hurtowe ze sklepu LL-HURT',
            html: render('orderClient', data),
            attachment: attachment
        }
        mailer.messages().send(emailOptionsToClient, function(error, body) {
            console.log(body);
        })

        const emailOptionsToBoss = {
            from: '<firma@e-szlafrok.com>',
            to: 'biuro@szlafroki.com',
            subject: `Zamowienie uzytkownika ${user.email}`,
            html: render('orderBoss', data),
            attachment: attachment
        }

        mailer.messages().send(emailOptionsToBoss, function(error, body) {
            console.log(body);
        })

        const emailOptionsToMe = {
            from: '<firma@e-szlafrok.com>',
            to: 'pieralukasz@gmail.com',
            subject: `Zamowienie uzytkownika ${user.email}`,
            html: render('orderBoss', data),
            attachment: attachment
        }


        mailer.messages().send(emailOptionsToMe, function(error, body) {
            console.log(body);
        })


    }, 1000)

    


}



export default {
    uploadImage,
    deleteImage,
    getXmlApi,
    sendImage,
    addBasket,
    orders,
    sendAgain
}