const Product = require("../models/product");
const mongodb = require("mongodb");
const product = require("../models/product");
exports.getAddProduct = (req, res, next) => {

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,

  });
};

exports.postAddProducts = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user  

  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    res.redirect("/");
  }
  const proId = req.params.productId;
  Product.findById(proId)
    // Product.findByPk(proId)
    .then((product) => {
      if (!product) {
        res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,

      });
    })

    .catch((err) => console.log(err));
};
exports.postEditProduct = (req, res, next) => {
  console.log(req.body);
  const prodId = req.body.productId;
  const updatedtitle = req.body.title;
  const updatedimageUrl = req.body.imageUrl;
  const updatedprice = req.body.price;
  const updateddescription = req.body.description;

Product.findById(prodId)
.then(product=>{
  if(product.userId != req.user._id){
    return res.redirect('/');
  }
  product.title=updatedtitle
  product.price=updatedprice
  product.imageUrl=updatedimageUrl
  product.description=updateddescription
  return product.save().then((result) => {
    console.log("Updated product");
    res.redirect("/admin/products");
  })
})
    
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  console.log('getprod');
  Product.find({userId:req.user._id}) 
  // .select('title price -_id')
  // .populate('userId','name')

    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postdeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne ({_id:prodId,userId:req.user._id})
    .then((result) => {
      console.log("Product Deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
