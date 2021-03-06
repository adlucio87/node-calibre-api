'use strict';

var multiparty = require('multiparty'),
    path = require('path'),
    CalibreService = require('../services/calibre'),
    debug = require('debug')('calibre-api:controller'),
    compare = require('tsscmp'),
    mime = require('mime-types'),
    eol = require("eol");

    var conversionTimeout = 10 * 60 * 1000;

module.exports.ebookConvert = function (req, res) {
    convert(req, res);
};

module.exports.ebookConvertBasicAuth = function (req, res) {
	
    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const strauth = new Buffer(b64auth, 'base64').toString()
    const splitIndex = strauth.indexOf(':')
    const login = strauth.substring(0, splitIndex)
    const password = strauth.substring(splitIndex + 1)

    //TODO: use firebase remote config credetial instead
    const userSecret = "sendtokindleapp_auth";
    const passwordSecret = "123sdkljfhsdkjfhsdkjhfsfkdjhf!!";
      
    ///////////////////////////////////////////////////////////////////////////
    //function to validate credentials using https://www.npmjs.com/package/tsscmp
    //Prevents timing attacks using Brad Hill's Double HMAC pattern to perform secure string comparison
    function check (name, pass) {
        var valid = true
        //return (name == userSecret && pass == passwordSecret)

        // Simple method to prevent short-circut and use timing-safe compare
        valid = compare(name, userSecret) && valid
        valid = compare(pass, passwordSecret) && valid

      return valid
    }

    if (!check(login, password)) {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="example"')
      res.end('Access denied')
    }
    ///////////////////////////////////////////////////////////////////////////

    convert(req, res);
};


function convert(req, res) {
    res.setTimeout(conversionTimeout);
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        if(!fields.to || fields.to.length !== 1) {
            res.status(400).send({error: 'Error: Missing "to" field in the form. The "to" field must be set to the output file extension wanted'});
            return;
        }
        if(!files.file || files.file.length !== 1) {
            res.status(401).send({error: 'Error: Missing file to convert in the form data'});
            return;
        }

        var toFormat = fields.to[0];
        //var fromFormat = fields.from[0];
        var fileToConvert = files.file[0];
        
        var ext = path.extname(fileToConvert.originalFilename);
        ext = (ext == "") ? mime.extension(mime.lookup(fileToConvert)) : ext;
        
        if (ext == "") {
            res.status(402).send({error: 'Error: Missing extension'});
            return;
        }
        
        //potrebbe essere utile utilizzare un nome variabile
        var newFilename = path.basename(fileToConvert.originalFilename, ext),
        outFile = fileToConvert.path.substring(0, fileToConvert.path.length - ext.length) + '.' + toFormat;
        var fsizemb = fileToConvert.size / 1000000.0;
        CalibreService.ebookConvert(fileToConvert.path, outFile, fsizemb, ext)
            .then( function(){
            debug('did it!, the epub exists!');               

            CalibreService.getBookMeta(outFile)
                .then(async function(meta){
                if(meta.count == 0)
                {
                    res.download(outFile, newFilename+ '.' + toFormat);
                }

                CalibreService.checkAndRenameTitle(meta, outFile, newFilename)
                .then( function(){
                    console.log("download!");

                    debug('download!');               
                    res.download(outFile, newFilename+ '.' + toFormat);    
                });
            
            }, function(err) {
                res.status(500).send({error: 'Error retriving meta', trace: err});
            });

        }, function(err) {
            res.status(500).send({error: 'Error while converting file', trace: err});
        });
   });

}