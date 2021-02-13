import mongoose from 'mongoose'
import randomstring from 'randomstring'

const BasketSchema = new mongoose.Schema({
    user_id: String,

    basketItems: Object,

    message: String,

    createdAt: Date,

    order_id: String

})

BasketSchema.pre('save', function() {
    this.createdAt = new Date()
    this.order_id = randomstring.generate(10).toUpperCase()
})


export default mongoose.model('Basket', BasketSchema)
