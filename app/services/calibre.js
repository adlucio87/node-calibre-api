var exec = require('child_process').exec,
    debug = require('debug')('calibre-api:service'),
    //LanguageDetect = require('languagedetect'),
    //checkWord = require('check-word'),
    eol = require("eol");


function ebookConvert (path, pathTo, fsizemb, ext) {
    //se file size > di 24 allora faccio lo shrink delle immagini
    //devo capire pure come farlo per i file pdf
    debug("file size is " + fsizemb + " mb. ext:" + ext.toString().toLowerCase());
    if (fsizemb > 24 && (ext.toString().toLowerCase().startsWith(".azw") || ext.toString().toLowerCase().startsWith(".epub") ))
    {
        debug("use compression mode");
        var tempfile = path.substr(0, path.lastIndexOf(".")) + "_tmp" + ext;
        //TODO: then dose not work added promise returned, to be tested.
        CompressImage(path, tempfile).then(function()
        {
            debug("conversion with compression");
            return executeCommand('ebook-convert ' + tempfile + ' ' + pathTo);
        }, function(err) {
            debug("Conversion compressed error: " + err);
        });
    }
    else
    {
        return executeCommand('ebook-convert ' + path + ' ' + pathTo);
    }
}
exports.ebookConvert = ebookConvert;

function changeTitleIfNotValid (path, title) {

    var actualTitle = "";
    executeCommand('ebook-meta ' + path).then(function(value) {
        debug('res value: ' + value);
        let lines = eol.split(value)
        lines.forEach(function(line) {
            if(line.trimStart().toLowerCase().startsWith("title"))
            {
                debug("line with title: " + line);  
                var lnpeace = line.split(":");
                if(lnpeace[1] != null && lnpeace[1] != "")
                {
                    actualTitle = lnpeace[1].trimStart().trimEnd();
                    debug("Detected inside title is: " + actualTitle);
                    if(actualTitle == null || actualTitle == "" || path.includes(actualTitle) )
                    {
                        return executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
                    }
                }
            }
        });
        return new Promise(() => {})  
    }, function(err) {
        debug("error: " + err);  
        return new Promise(() => {})
    });
    //return new Promise();
    //potrebbe essere sufficente fermarmi qui per adesso faccio così poi vediamo..
    //il codice sotto cerca di riconoscere la lingua e le parole
    /*
    const lngDetector = new LanguageDetect();
    lngDetector.setLanguageType("iso2");
    lang = lngDetector.detect(actualTitle)
    if( lang == null || lang[0] == "")
    {
        return executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
    }
    debug("detect lang: " + lang);
    checker = checkWord(lang);
    var words = actualTitle.split(" ");
    //TODO: to be tested
    words.forEach(word => {
        if(checker.check(word) == true)
        {
            debug("detect word: " + word);
            return new Promise();
        }
    });
    return executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
    */
}
exports.changeTitleIfNotValid = changeTitleIfNotValid;


//support function
const changeTitle = function change (path, title) {
    return executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
}

const CompressImage = function Compress(path, tempfile)
{
    return executeCommand('ebook-polish --compress-images ' + path + ' ' + tempfile);
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
