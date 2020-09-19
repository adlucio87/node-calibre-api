var exec = require('child_process').exec,
    debug = require('debug')('calibre-api:service'),
    //LanguageDetect = require('languagedetect'),
    //checkWord = require('check-word'),
    eol = require("eol");
    awaitExec = require('await-exec')


async function ebookConvert (path, pathTo, fsizemb, ext) {
    //se file size > di 24 allora faccio lo shrink delle immagini
    //devo capire pure come farlo per i file pdf
    debug("file size is " + fsizemb + " mb. ext:" + ext.toString().toLowerCase());
    if (fsizemb > 24 && (ext.toString().toLowerCase().startsWith(".azw") || ext.toString().toLowerCase().startsWith(".epub") ))
    {
        debug("use compression mode");
        var tempfile = path.substr(0, path.lastIndexOf(".")) + "_tmp" + ext;
        
        await CompressImage(path, tempfile);
        
        
        return executeCommand('ebook-convert ' + tempfile + ' ' + pathTo);
    }
    else
    {
        return executeCommand('ebook-convert ' + path + ' ' + pathTo);
    }
}
exports.ebookConvert = ebookConvert;


async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

function checkAndRenameTitle (meta, path, title) {
    return new Promise(function(resolve, reject) {
        var actualTitle = "";
        var exit = true;
        let lines = eol.split(meta);

        lines.forEach(function(line) {
            if(line.replace(/\s/g, "").toLowerCase().startsWith("title:"))
            {
                var lnpeace = line.split(":");
                actualTitle = lnpeace[1].trimStart().trimEnd();
                debug("Detected inside title is: " + actualTitle);
                debug("Filename: " + path);
                if(actualTitle == null || actualTitle == "" || path.includes(actualTitle.replace(/\s/g, "_")) )
                {
                    exit = false;
                }
            }
        });
        if(exit)
        {
            debug("Title present can exit");
            resolve("Title present can exit");
        }
        else
        {
            var command = 'ebook-meta ' + path + ' --title "' + title + '"' 
            executeCommand(command)
                .then( function(){
                    resolve("OK");
                }, function(err) {
                    reject(err);                        
                });
        }
    });
}
exports.checkAndRenameTitle = checkAndRenameTitle;


function changeTitleIfNotValid (meta, title) {
    var actualTitle = "";
    let lines = eol.split(meta);
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
    return new Promise(() => {});

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




function getBookMeta(path, tempfile)
{
    return executeCommand('ebook-meta ' + path)
}
exports.getBookMeta = getBookMeta;

//support function
function changeTitle (path, title) {
    return executeCommand('ebook-meta ' + path + ' --title "' + title + '"' );
}
exports.changeTitle = changeTitle;


const CompressImage = async function Compress(path, tempfile)
{
    return executeCommand('ebook-polish --compress-images ' + path + ' ' + tempfile);
}

function executeCommand (command) {
    return new Promise(function(resolve, reject) {
        debug("will execute", command);        
        //for test
        //setTimeout(function(){  }, 3000);
        //resolve("ok");
        var child = exec(command, function (error, stdout, stderr) {
            if (error !== null) {
                debug('Error after command executed:');
                debug("err");
                debug(error);
                debug(stderr);
                debug(stdout);
                reject(stderr);
            }
            else {
                debug("command execution finish");
                resolve(stdout);
            }
        });
        
    });
}