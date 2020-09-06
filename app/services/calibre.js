var exec = require('child_process').exec,
    debug = require('debug')('calibre-api:service'),
    LanguageDetect = require('languagedetect'),
    checkWord = require('check-word');

const executeCommand = function execute (command) {
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

function ebookConvert (path, pathTo, fsizemb) {
    //se file size > di 24 allora faccio lo shrink delle immagini
    debug("file size is " + fsizemb + " mb");
    if (fsizemb > 24)
    {
        debug("conversion with compression");
        return executeCommand('ebook-convert ' + path + ' ' + pathTo + ' --compress-images');
    }
    else{
        return executeCommand('ebook-convert ' + path + ' ' + pathTo);
    }
}
exports.ebookConvert = ebookConvert;


function changeTitle (path, title) {
    executeCommand('ebook-meta ' + path + ' --title ' + title );
}
exports.changeTitle = changeTitle;

function IsValidTitle (path) {

    var res = executeCommand('ebook-meta ' + path);
    var actualTitle = "";
    var i = 0;
    while (i < res.length)
    {
        var j = res.indexOf("\\n", i);
        if (j == -1) j = res.length;
        var line = res.substr(i, j-i);
        if(line.startsWith("Title"))
        {
            debug("line with title: " + line);            
            actualTitle = line.replace( "Title               : ", "");
            break;
        }
        i = j+1;
    }
    debug("Detected inside title is: " + actualTitle);
    if(actualTitle == null || actualTitle == "")
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
    debug("detect lang: " + lang);
    checker = checkWord(lang);
    var words = actualTitle.split(" ");    
    words.forEach(word => {
        if(checker.check(word) == true)
        {
            debug("detect word: " + word);
            return true;
        }
    });
    return false;
}
exports.IsValidTitle = IsValidTitle;