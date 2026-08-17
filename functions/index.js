const admin = require('firebase-admin');
admin.initializeApp();

const onStockInCreate = require('./triggers/onStockInCreate');
const onSaleCreate = require('./triggers/onSaleCreate');
const onPaymentCreate = require('./triggers/onPaymentCreate');
const generateNotaNumber = require('./triggers/onNotaGenerate');

exports.onStockInCreate = onStockInCreate;
exports.onSaleCreate = onSaleCreate;
exports.onPaymentCreate = onPaymentCreate;
exports.generateNotaNumber = generateNotaNumber;
