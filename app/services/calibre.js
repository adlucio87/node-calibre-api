var exec = require('child_process').exec,
    debug = require('debug')('calibre-api:service'),
    LanguageDetect = require('languagedetect'),
    checkWord = require('check-word');


function ebookConvert (path, pathTo, fsizemb, ext) {
    //se file size > di 24 allora faccio lo shrink delle immagini
    debug("file size is " + fsizemb + " mb");
    if (fsizemb > 24 && (ext.toLowerCase().startsWith(".azw") || ext.toLowerCase() == ".epub") )
    {
        var tempfile = pathTo.substr(0, pathTo.lastIndexOf(".")) + ext;
        debug("conversion with compression");
        executeCommand('ebook-polish --compress-images ' + path + ' ' + tempfile).then(function()
        {
            return executeCommand('ebook-convert ' + tempfile + ' ' + pathTo);
        }, function(err) {
            return executeCommand('ebook-convert ' + path + ' ' + pathTo);
        });
    }
    else{
        return executeCommand('ebook-convert ' + path + ' ' + pathTo);
    }
}
exports.ebookConvert = ebookConvert;



function changeTitleIfNotValid (path, title) {

    var res = executeCommand('ebook-meta ' + path);
    var actualTitle = "";
    var i = 0;
    debug(res);
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
        changeTitle(path,title).then(function()
        {
            return true;
        });
    }
    const lngDetector = new LanguageDetect();
    lngDetector.setLanguageType("iso2");
    lang = lngDetector.detect(actualTitle)
    if( lang == null || lang[0] == "")
    {
        changeTitle(path,title).then(function()
        {
            return true;
        });
    }
    debug("detect lang: " + lang);
    checker = checkWord(lang);
    var words = actualTitle.split(" ");
    var detected = false; 
    words.forEach(word => {
        if(checker.check(word) == true)
        {
            debug("detect word: " + word);
            detected = true;
            break;
        }
    });
    if(detected==false)
    {
        changeTitle(path,title).then(function()
        {
            return true;
        });
    }
    return false;
}
exports.changeTitleIfNotValid = changeTitleIfNotValid;


//support function
const changeTitle = function change (path, title) {
    executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
}

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
