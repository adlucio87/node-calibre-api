var exec = require('child_process').exec,
    debug = require('debug')('calibre-api:service'),
    LanguageDetect = require('languagedetect'),
    checkWord = require('check-word');


function ebookConvert (path, pathTo, fsizemb, ext) {
    //se file size > di 24 allora faccio lo shrink delle immagini
    //devo capire pure come farlo per i file pdf
    debug("file size is " + fsizemb + " mb");
    if (fsizemb > 24 && (ext.toString().toLowerCase().startsWith(".azw") || ext.toString().toLowerCase() == ".epub") )
    {
        var tempfile = pathTo.substr(0, pathTo.lastIndexOf(".")) + ext;
        debug("conversion with compression");
        //TODO: verificare non funziona il then se non con una promise...
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
    //debug(res);
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
    //TODO: aggiungere verifica di actual title contain in path
    //|| actualTitle.endsWith(path.)
    if(actualTitle == null || actualTitle == "" )
    {
        executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
        return true;
    }
    const lngDetector = new LanguageDetect();
    lngDetector.setLanguageType("iso2");
    lang = lngDetector.detect(actualTitle)
    if( lang == null || lang[0] == "")
    {
        executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
        return true;
    }
    debug("detect lang: " + lang);
    checker = checkWord(lang);
    var words = actualTitle.split(" ");
    var detected = false; 
    try {
        //TODO: verificare in quanto da errore
        words.forEach(word => {
            if(checker.check(word) == true)
            {
                debug("detect word: " + word);
                detected = true;
                throw BreakException;
            }
        });
    } catch (e) {
        if (e !== BreakException) throw e;
    }

    if(detected==false)
    {
        executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
        return true;
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
