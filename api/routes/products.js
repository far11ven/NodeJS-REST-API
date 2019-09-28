const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../../models/product');


router.get('/', (req, res, next) =>{

    Product.find()
    .select('-__v')
    .exec()
    .then(docs => {
        console.log(docs);

        if(docs.length>=0){
            res.status(200).json({
                message: "GET requests for /products",
                createdProducts : docs
                 });
        } else {
            res.status(200).json({
                message: "GET requests for /products",
                error : "No Entries Found"
                 });
        }
        

   })
   .catch(err => {
       console.log(err);
        res.status(500).json({
        message: "GET requests for /products",
        error : err
         });

   })

});

router.get('/:productId', (req, res, next) =>{

    const id = req.params.productId;

    Product.findById(id)
    .exec()
    .then(doc => {
        console.log(doc);

        if(doc){
          res.status(200).json({
            message: "GET requests for /products/{productId}",
            document: doc
          });
        } else{
            res.status(404).json({
                message: "GET requests for /products/{productId}",
                error: 'No Doc is present with passed ObjectId'
            });

         }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: "GET requests for /products/{productId}",
            error: err
        });
    });
});

router.post('/', (req, res, next) =>{
    
   const product = new Product({

    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price

   });

   product.save()
   .then(result => {
       console.log(result);
       res.status(201).json({
        message: "POST requests for /products",
        document: result,
    });
   })
   .catch(err => {
       console.log(err);
       res.status(500).json({
        message: "POST requests for /products",
        error: err
        });
    });

});

router.patch('/:productId', (req, res, next) =>{

    const id = req.params.productId;
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
        message: "UPDATE requests for /products/{productId}",
        result : result
         });

   })
   .catch(err => {
       console.log(err);
        res.status(500).json({
        message: "UPDATE requests for /products/{productId}",
        error : err
         });

   })

});

router.delete('/:productId', (req, res, next) =>{

    const id = req.params.productId;

    Product.remove({_id: id})
    .exec()
    .then(result => {
        console.log(result);
        res.status(200).json({
        message: "DELETE requests for /products/{productId}",
        result : result
         });

   })
   .catch(err => {
       console.log(err);
        res.status(500).json({
        message: "DELETE requests for /products/{productId}",
        error : err
         });

   })

});

module.exports = router;