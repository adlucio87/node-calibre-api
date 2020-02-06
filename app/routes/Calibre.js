'use strict';

var calibreCtrl = require('../controllers/CalibreCtrl');

module.exports = function (app) {

    app.route('/calibre/ebook-convert')
        .post(calibreCtrl.ebookConvert);
    
    app.route('/calibre/ebook-convert-basicauth')
        .post(calibreCtrl.ebookConvertBasicAuth);

};
