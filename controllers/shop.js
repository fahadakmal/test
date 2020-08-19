
const Product = require('../models/product');
const user = require('../models/user');
const Order=require('../models/order');

exports.getProducts=(req, res, next) => {
  Product.find()
  .then(products =>{
    console.log(products);
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',

  
    });
  })
  .catch(err => {
    console.log(err)
  });

};

exports.getProduct=(req,res,next)=>
{
  const prodId=req.params.productId;
  Product.findById(prodId)

  // Product.findByPk(prodId) 
  .then((product)=>{
    res.render('shop/product-detail',{
      product:product,
      pageTitle: product.title,
          path: '/products',

    });
  })
  .catch(err => console.log(err));
};

exports.getIndex=(req,res,next)=>{
  Product.find().then(products =>{
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
 
  
    });
  })
  .catch(err => {
    console.log(err)
  });


};

exports.getCart=(req,res,next)=>{
  req.user.getCart().then(
    cart =>{
      return cart.getProducts()
      .then(products =>{
        res.render('shop/cart',{
              path:"/cart",
              pageTitle:"Your Cart",
              products:products,

          
              });
      })
      .catch(err => console.log(err));
    }
  ).catch(err => console.log(err))


};

exports.postCart=(req,res,next)=>{

const prodId=req.body.productId;
Product.findById(prodId)
.then(product =>{
  return req.user.addToCart(product);
})
.then(result =>{
  console.log(result);
});
// let fetchedCart;
// let newQuantity =1;
// req.user
//   .getCart()
//   .then(cart =>{
//     fetchedCart=cart;
//     return cart.getProducts({where:{id:prodId}});
//   })
//   .then(products =>{
//     let product;
//     if(products.length >0 )
//     {
//       product=products[0];

//     }
//     if(product)
//     {
//       const oldQuantity =product.cartItem.quantity;
//       newQuantity= oldQuantity+1
//       return product;
  
//     }
//     return Product.findByPk(prodId)
    
//     }).then(product =>{
//       return fetchedCart.addProduct(product,{
//         through:{quantity:newQuantity}
//       })
    

//   }).then(()=>{
//     res.redirect('/cart');
//   })
//   .catch(err =>console.log(err));
};
exports.getCart=(req,res,next)=>{
req.user
.populate('cart.items.productId')
.execPopulate()
.then(user=>{
  const products=user.cart.items;
  console.log(products);
  res.render('shop/cart',{
    path:'/cart',
    pageTitle:'Your Cart',
    products:products,

  });
})
.catch(err =>console.log(err));
};
exports.postCartDeleteProduct=(req,res,next)=>
{
const prodId=req.body.productId;
req.user.removeFromCart(prodId)
.then(result=>{
  console.log('product deleted');
}
)
.catch(err => console.log(err));
};


exports.postOrder=(req,res,next)=>
{
  req.user
.populate('cart.items.productId')
.execPopulate()
.then(user=>{
  const products=user.cart.items.map(i =>{
return {quantity: i.quantity,product:{...i.productId._doc}}
  });
  const order =new Order({
    user:{
      email:req.user.email,
      userId:req.user
    },
    products:products
  });
 return  order.save();
})
.then(result =>{
  return req.user.clearCart();
})
.then(result =>{
  console.log('order placed');
res.redirect('/orders');
})


.catch(err =>console.log(err));
};

exports.getOrders=(req,res,next)=>{
  console.log('i am in');
  console.log(req.user);
  Order.find({"user.name":req.user.name})
  .then(orders=>{
    console.log(orders);
    res.render('shop/orders',{
      path:"/orders",
      pageTitle:"Your Orders",
      orders:orders,

      });
  })
  .catch(err => console.log(err));

  };
  

exports.getCheckOut=(req,res,next)=>{
res.render('shop/checkout',{
  path:'/checkout',
  pageTitle:'Checkout'
});

};