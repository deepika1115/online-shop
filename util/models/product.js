// const fs = require('fs');
// const path = require('path');

// const p = path.join(
//   path.dirname(process.mainModule.filename),
//   'data',
//   'products.json'
// );

// const getProductsFromFile = cb => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {   
//     getProductsFromFile(products => {
//       if(this.id){
//         //update product
//         const existingProductIndex = products.findIndex(p => p.id === this.id)
//         console.log("existingProductIndex--",existingProductIndex)
//         const existingProduct = products[existingProductIndex]

//         if(existingProduct){  
//           products[existingProductIndex] = this;        
//         }      
//       }else{
//         this.id = Math.random().toString();
//         products.push(this);
//       }
//       fs.writeFile(p, JSON.stringify(products), err => {
//         console.log(err);
//       });
//     });
//   }

//   static fetchAll(cb) {
//     getProductsFromFile(cb);
//   }

//   static findById(prodId, cb){
//     console.log("prodId--",prodId)
//     getProductsFromFile(products =>{
//       const product = products.find(p => p.id === prodId)
//       cb(product)
//     });
//   }

//   static deleteProduct(prodId){
//     getProductsFromFile(products =>{
//       const updatedProducts = products.filter(p => p.id !== prodId)
//       fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//         console.log(err);
//       });
//     })
//   }
// };
const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;

class Product{
  constructor(id, title, imageUrl, description, price, userId) {
    this._id = id  ? new mongodb.ObjectId(id) : null;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this.userId = userId;
  }

  save(){
    const db = getDb();
    let dbOp;
    if(this._id){
      //update product
      dbOp = db.collection('products').updateOne({_id : this._id}, {$set : this});
    }else{
      //add new product
      dbOp = db.collection('products').insertOne(this);
    }
    dbOp.then(result => {
      console.log(result)
      return result
    }).catch(err => {
      console.log(err)
      throw new Error(err);
    })
  }

  static fetchAll() {
    const db = getDb();
    return db.collection('products').find().toArray().then(result => {
      return result
    }).catch(err => {
      console.log(err)});
  }

  static findById(prodId){
    console.log("prodId--",prodId)
    const db = getDb();
    return db.collection('products').find({_id : new mongodb.ObjectId(prodId)}).next()
    .then(result =>{
      return result
    })
    .catch(err => {
      (console.log(err))
    })
  }

  static deleteProduct(prodId){
    const db = getDb();
    return db.collection('products').deleteOne({_id : new mongodb.ObjectId(prodId)}).then(result => {
      console.log("deleted")
    }).catch(err => {
      console.log(err)
    })
  }

};

module.exports = Product;
