const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth')

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:prodId', shopController.getProduct);

router.get('/cart',isAuth, shopController.getCart);

router.post('/cart',isAuth,  shopController.postCart);

router.post('/cart-delete-item',isAuth,  shopController.postDeleteCartProduct);

router.post('/checkout',isAuth, shopController.postCheckout);

router.get('/checkout/success', shopController.getCheckoutSuccess);

router.get('/checkout/cancel', shopController.getOrders);

router.get('/orders',isAuth, shopController.getOrders);

router.get('/orders/:orderId',isAuth, shopController.getInvoice);

module.exports = router;
