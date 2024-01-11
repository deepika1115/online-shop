const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;
const objectId = mongodb.ObjectId;


class User{
    constructor(name, email, password, cart, id,token=null){
        console.log("name", name,email,cart,id)
        this.name = name;
        this.email = email;
        this.password = password;
        this.cart = cart ? cart : {items : []};
        this._id = id;
        this.resetToken = token;
        if(token){
            this.tokenExpiration = Date.now() + 3600000;
        }       
    }

    save(){
        const db = getDb();
        let dbOp;
        if(this._id){
        //update product
        dbOp = db.collection('users').updateOne({_id : this._id}, {$set : this});
        }else{
        //add new product
        dbOp = db.collection('users').insertOne(this);
        }
        dbOp.then(result => {
            console.log(result)
          }).catch(err => {
            console.log(err)
          })
        }

    static findById(userId){
        const db = getDb();
        return db.collection('users').findOne({_id : new objectId(userId)}).then(result => {
            return result
        }).catch(err => {
            console.log(err);
        });
    }

    static findOne(query){
        const db = getDb();
        return db.collection('users').findOne(query).then(result => {
            return result
        }).catch(err => {
            console.log(err);
        });
    }

    addToCart(productId){
        const productIndex = this.cart.items.findIndex(i => {
            return i.productId.toString() === productId.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        if(productIndex >= 0){
            newQuantity = this.cart.items[productIndex].quantity + 1;
            updatedCartItems[productIndex].quantity = newQuantity;
        }else{
            updatedCartItems.push({productId : new objectId(productId), quantity : newQuantity})
        }
        this.cart = {items : updatedCartItems}
        const db = getDb();
        return db.collection('users').updateOne({_id : this._id}, {$set : this}).then(result => {
            return result
        }).catch(err => {
            console.log(err);
        });

    }

    getCart(){
        if(this.cart.items && this.cart.items.length){
            const productIds = this.cart.items.map(p => {
                return p.productId;
            })
            const db = getDb();
            return db.collection('products').find({_id : {$in : productIds}}).toArray().then(products => {
                return products.map(p =>{
                    return {...p, quantity : this.cart.items.find(i => {
                        return i.productId.toString() ==   p._id.toString();
                    }).quantity}
                })
            })
        }
        return new Promise((resolve,reject) =>{
            resolve([])
        })    
    }

    deleteCartProduct(productId){
        const updatedCartItems = this.cart.items.filter(i => {return  i.productId.toString() != productId});
        this.cart.items = updatedCartItems
        const db = getDb();
        return db.collection('users').updateOne({_id : this._id}, {$set : this});
    }

    createOrder(){
        const db = getDb();
        return this.getCart().then(products => {
            return db.collection('orders').insertOne({user : {_id : this._id, name : this.name}, items : products}).then(result => {
                this.cart = {items : []}
                return db.collection('users').updateOne({_id : this._id}, {$set : this})
            })
        })
    }

    getOrders(){
        const db = getDb();       
        return db.collection('orders').find({'user._id' : this._id}).toArray();
    }

    getOrderById(orderId){
        const db = getDb();
        return db.collection('orders').findOne({_id : new objectId(orderId)}).then(result => {
            return result
        }).catch(err => {
            console.log(err);
            throw new Error(err)
        });
    }

}

module.exports = User;