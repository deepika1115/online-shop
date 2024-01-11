const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'cart.json'
);

module.exports = class Cart {
    static addProduct(id, price){
        //fetch the cart products
        fs.readFile(p, (err, filecontent) => {
            let cart = {products: [], totalPrice : 0}
            if (!err) {
                cart = JSON.parse(filecontent)
            }
            const existingProductIndex = cart.products.findIndex(p => p.id === id)
            const existingProduct = cart.products[existingProductIndex]
            if (existingProduct){
                cart.products[existingProductIndex]["qty"] = existingProduct.qty + 1
            }else{
                const newProduct = {id: id, qty : 1}
                cart.products.push(newProduct)
            }
            cart.totalPrice = +cart.totalPrice + +price
            fs.writeFile(p, JSON.stringify(cart), err=>{
                console.log(err)
            })
        });
    }

    static deleteCartProduct(id, price){
        fs.readFile(p, (err, filecontent) => {
            let cart = JSON.parse(filecontent)
            let product = cart.products.find(p => p.id === id)
            const updatedProducts = cart.products.filter(p => p.id !== id)
            cart.products = updatedProducts
            cart.totalPrice = cart.totalPrice - (price * product.qty)
            fs.writeFile(p, JSON.stringify(cart), err=>{
                console.log(err)
            })
        })
    }
}