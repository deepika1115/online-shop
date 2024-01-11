const Product = require('../models/product');
const Cart = require('../models/cart');
const fileHelper = require('../util/fileHelper')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    errorMessage : null
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image){
    res.render('admin/add-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true,
      errorMessage : 'Attached file is not a valid image'
    });
  }
  const imageUrl = `/${image.path}`;
  try{
  const product = new Product(null,title, imageUrl, description, price, req.user._id);
  product.save();
  }catch(err) {
    next(new Error(err))
  };
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      formsCSS: true,
      productCSS: true,
      activeAddProduct: true
    });
  });
};

exports.getEditProduct =(req,res,next) => {
 Product.findById(req.params.productId).then(productDetail => {
  res.render('admin/edit-product', {
    product : productDetail,
     pageTitle: 'Edit Product',
    path: '/admin/edit-product',
    errorMessage : null  })
 })
}

 exports.postEditProduct = (req,res,next) => {
    const id = req.body.id;
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    let imageUrl = req.body.imageUrl;
    if(image){
      if(imageUrl){
        fileHelper.deleteFile(imageUrl.slice(1));
      }
      imageUrl = `/${image.path}`
    }
    const product = new Product(id,title, imageUrl, description, price);
    product.save();
    res.redirect('/admin/products');
}

exports.deleteProduct = (req,res,next) => {
  Product.findById(req.body.id)
  .then(product => {
    if(product.imageUrl){
      fileHelper.deleteFile(product.imageUrl.slice(1))
    }
    return Product.deleteProduct(req.body.id);
  }).then(()=>{
    console.log("product deleted")
    res.redirect('/admin/products');
  });
  
  // Cart.deleteCartProduct(req.body.id, productDetail.price)
}
