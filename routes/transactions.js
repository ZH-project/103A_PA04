/*
  transactions.js -- Router for the Transactions
*/
const express = require('express');
const router = express.Router();
const transaction = require('../models/Transactions')
const User = require('../models/User')


isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/transaction', isLoggedIn, async (req, res) => {
    res.locals.groupByCategory = false
    let transactions
    if (req.query.groupBy == 'category') {
        res.locals.groupByCategory = true
        transactions = await transaction.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            }
        ])
    }
    else if (req.query.sortBy == 'category') {
        transactions = await transaction.find({
            userId: req.user._id }).sort({ category:1 
        })
    }
    else if (req.query.sortBy == 'amount') {
        transactions = await transaction.find({
            userId: req.user._id }).sort({ amount:-1 
        })
    }
    else if (req.query.sortBy == 'description') {
        transactions = await transaction.find({
            userId: req.user._id }).sort({ description:1
            })
    }
    else if (req.query.sortBy == 'date') {
        transactions = await transaction.find({
            userId: req.user._id }).sort({ date:1
        })
    }
    else {
        transactions = await transaction.find({
            userId: req.user._id
        })
    }
    res.render('transaction', {transactions})
})


router.post('/transaction', isLoggedIn, async (req, res) => {
    const trans = new transaction({
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date,
        userId: req.user._id
    })
    await trans.save()
    res.redirect('/transaction')
})

router.post('/transaction/edit', isLoggedIn, async (req, res) => {
    const {description, amount, category, date, itemId} = req.body
    await transaction.findOneAndUpdate(
        {_id: itemId},
        {$set: { description, amount, category, date}});
    res.redirect('/transaction')
})

router.get('/transaction/remove/:transactionId', isLoggedIn, async (req, res) => {
    await transaction.deleteOne({_id: req.params.transactionId});
    res.redirect('/transaction')
})


router.get('/transaction/edit/:transactionId', isLoggedIn, async (req, res) => {
    const item = await transaction.findById(req.params.transactionId)
    res.render('transEdit', { item })
})

module.exports = router