var exec = require('child_process').exec,
    logger = require('util'),
    debug = require('debug')('calibre-api:service');

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

    var a = executeCommand('ebook-meta' + path);
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
    
    if(actualTitle=="")
    {
        executeCommand('ebook-meta' + path + ' -t ' + title );
    }
}

exports.changeTitle = changeTitle;



