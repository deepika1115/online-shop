const { Console } = require('console');
const fs = require('fs');
const path = require('path');
const pdfDocument = require('pdfkit')

const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

exports.getProduct = (req,res,next) => {
  const productId = req.params.prodId
  Product.findById(productId).then( productDetail=>{
    res.render('shop/product-detail', {product : productDetail, pageTitle : productDetail.title, path : '/products'})
  })
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

exports.getCart = (req, res, next) => {
  req.user.getCart().then(products => {
    if(products.length > 1){
      totalPrice = products.reduce((a,b) => {return (+a.price * a.quantity) + (+b.price * b.quantity)});
    }else{
      totalPrice = products[0].price * products[0].quantity;
    }
    res.render('shop/cart', {
      path: '/cart',
      products : products,
      pageTitle: 'Your Cart',
      totalPrice : totalPrice

    });
  })
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId
  req.user.addToCart(productId).then(result =>{
    res.redirect('/cart')
  }) 
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user.createOrder().then(result =>{
    res.redirect('/orders')
  })
}

exports.postCheckout = async(req,res,next) => {
  let lineItems = [];
  const cartProduct = await req.user.getCart();
  for (i=0; i < cartProduct.length; i ++){    
    const product = await stripe.products.create({
      name: cartProduct[i].title
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000,
      currency: 'usd',
    });
    lineItems.push({
      price: price.id,
      quantity: cartProduct[i].quantity,
    })
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
    cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
  });
  res.redirect(303, session.url);
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders().then(orders => {
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders : orders
    });
  })
};

exports.postDeleteCartProduct = (req, res, next) => {
  req.user.deleteCartProduct(req.body.productId).then(result => {
    res.redirect('/cart')
  })
};

exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;
  req.user.getOrderById(orderId).then(order => {

    const invoiceName = `order-${orderId}.pdf`
    const invoicePath = path.join('data','invoices', invoiceName)

    const pdfDoc = new pdfDocument()

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    res.setHeader('Content-Type', 'application/pdf')
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice')
    pdfDoc.text('-------------------------------')
    let totalPrice = 0
    pdfDoc.fontSize(12).text(`Item  -  Price  *  Quantity`)
    pdfDoc.text('   ')
    order.items.forEach(item => {
      totalPrice = totalPrice + (+item.price * +item.quantity);
      pdfDoc.fontSize(12).text(`${item.title}  -  $${+item.price}  *  ${+item.quantity}`)
    });
    pdfDoc.text('-------------------------------')
    pdfDoc.text('   ')
    pdfDoc.fontSize(18).text('Total Price : $' + totalPrice)


    pdfDoc.end();
  }).catch(err =>{
    next(err);
  })
  
}
  
