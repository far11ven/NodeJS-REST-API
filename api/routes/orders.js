const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {

    res.status(200).json({

        message: 'GET request for /orders',
        order: order
    })

});

router.post('/', (req, res, next) => {

    const order = { 
        productId: req.body.productId,
        quantity: req.body.quantity

    };

    res.status(201).json({

        message: 'POST request for /orders',
        order : order
    })

});

router.get('/:orderId', (req, res, next) => {

    const id = req.params.orderId;

    res.status(200).json({
        message: 'GET request for /orders/(id}',
        id: id
    })

});

router.delete('/:orderId', (req, res, next) => {

    const id = req.params.orderId;
    res.status(200).json({
        message: 'DELETE request for /orders/(id}',
        id: id
    })

});


module.exports = router;