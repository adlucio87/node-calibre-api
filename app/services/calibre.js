var exec = require('child_process').exec,
    logger = require('util'),
    debug = require('debug')('calibre-api:service');

    var LanguageDetect = require('languagedetect');
    var checkWord = require('check-word'),


function executeCommand (command) {
    return new Promise(function(resolve, reject) {
        debug("will execute", command);
        var child = exec(command, function (error, stdout, stderr) {
            if (error !== null) {
                debug('Error after command executed:');
                debug(error);
                debug(stderr);
                debug(stdout);
                reject(stderr);
            }
            else {
                resolve(stdout);
            }
        });
    });
}

function ebookConvert (path, pathTo) {
    return executeCommand('ebook-convert ' + path + ' ' + pathTo);
}
exports.ebookConvert = ebookConvert;


function changeTitle (path, title) {
    executeCommand('ebook-meta' + path + ' -t ' + title );
}
exports.changeTitle = changeTitle;


function IsValidTitle (path, title) {

    var a = executeCommand('ebook-meta' + path + title);
    var actualTitle = "";
    var lines = $(a).val().split('\n');
    for(var i = 0;i < lines.length;i++){
        //code here using lines[i] which will give you each line
        if(lines[i].startsWith("Title"))
        {
            actualTitle = lines[i].replace( "Title               : ", "");
            break;
        }
    }

    if(actualTitle == null || actualTitle=="" )
    {
        return false;
    }

    const lngDetector = new LanguageDetect();
    lngDetector.setLanguageType("iso2");
    lang = lngDetector.detect(actualTitle)
    if( lang == null || lang[0] == "")
    {
        return false;
    }
    checker = checkWord(lang);

    var words = actualTitle.split(" ");    
    
    words.forEach(word => {
        if(checker.check(word) == true)
        {
            return true;
        }
    });

    return false;
}
exports.IsValidTitle = IsValidTitle;