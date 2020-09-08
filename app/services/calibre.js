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
        var tempfile = path.substr(0, path.lastIndexOf(".")) + "_tmp" + ext;
        debug("conversion with compression");

        //TODO: then dose not work added promise returned, to be tested.
        CompressImage(path, tempfile).then(function()
        {
            return executeCommand('ebook-convert ' + tempfile + ' ' + pathTo);
        }, function(err) {
            debug("Conversion compressed error");
        });
    }
    return executeCommand('ebook-convert ' + path + ' ' + pathTo);
}
exports.ebookConvert = ebookConvert;

function changeTitleIfNotValid (path, title) {

    var res = executeCommand('ebook-meta ' + path);
    var actualTitle = "";
    var i = 0;
    res.then(function(value) {
        debug('res value: ' + value);
        debug('res value lenght: ' + res.length);
    });
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
    if(actualTitle == null || actualTitle == "" || path.includes(actualTitle) )
    {
        return executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
    }
    return new Promise();
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
