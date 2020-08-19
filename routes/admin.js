const path = require('path');

const express = require('express');

// const rootDir = require('../util/path');
const adminController=require('../controllers/admin');
const isAuth=require('../middlaware/is-auth');

const router = express.Router();


// /admin/add-product => GET
router.get('/add-product',isAuth,adminController.getAddProduct);
router.get('/products',isAuth,adminController.getProducts);
// // /admin/add-product => POST
router.post('/add-product',isAuth,adminController.postAddProducts );

router.get('/edit-product/:productId',isAuth,adminController.getEditProduct);
router.post('/edit-product',isAuth,adminController.postEditProduct);


router.post('/delete-product',isAuth,adminController.postdeleteProduct);

exports.routes = router;
