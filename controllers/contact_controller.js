'use strict';

let ContactDB = require('../models/contact_db');
let Joi = require('joi');
let IsEmpty = require('is-empty');
let ErrorUtil = require('../utils/error_util');


async function _validateSendContactParams(params) {
    var emailPattern = /^([a-zA-Z0-9]+[-_.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-_.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,6}$/,
        namePattern = /^[\u4E00-\u9FA5A-Za-z]{1,20}$/,
        messagefailPattern = /^<\/?[^>]*>$/,
        messagePattern = /^.{10,200}$/;
        //console.log(`email => ${params.email}`);
        //console.log(`phone => ${params.phone}`);
        //console.log(`name => ${params.name}`);
    if(namePattern.test(params.name) && !messagefailPattern.test(params.message) && messagePattern.test(params.message) && emailPattern.test(params.email)) {
        //console.log("name phone gotcha");
        return true
    }
    return false;
}

exports.sendInf = async params => {
    if (!await _validateSendContactParams(params)) {
        throw ErrorUtil.createError(ErrorUtil.ErrorSet.REQUEST_PARAMETER_ERROR);
    }
    let data = await ContactDB.sendInf(params);
    return data;
}

