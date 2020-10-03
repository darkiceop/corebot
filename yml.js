/* const fs = require("fs");
module.exports = async (fileName) => {
    return new Promise(function(resolve, reject) {
        fs.readFile(fileName, 'utf-8', function(err, file) {
            if(err) return reject(err);
            let fileObj = {};
            let lines = file.split("\n");
            let usedLines = [];
            lines.forEach((line, index) => {
                //if the line is not a comment and is not an empty line
                if(!line.startsWith("#") && !line.match(/^(\n|\r)$/)) {
                    //get the key of the line
                    let key = line.split(": ")[0];
                    //get the value of the line
                    let value = line.split(": ")[1];
                    //if there is no value
                    if(!value) {
                        let obj = {};
                        let ln = 1;
                        while(lines[index+ln] && lines[index+ln].startsWith("  ")) {
                            let l = lines[index+ln];
                            let k = l.split(": ")[0];
                            let v = l.split(": ")[1];
                            if(parseInt(v)) v = parseInt(v);
                            else v = v.replace(/(\r|"|')/g, '').replace(/\\n/g, '\n');
                            k = k.replace(/(\r|"|')/g, '').replace(/\\n/g, '\n').split(" ").slice(2).join("");
                            obj[k] = v;
                            usedLines.push(index+ln);
                            ln++;
                        }
                        key = key.replace(/(\r|"|')/g, '').replace(/\\n/g, '\n').split("").reverse().slice(1).reverse().join("");
                        fileObj[key] = obj;

                    } else {
                        //there is a value and the line has not been used
                        if(!usedLines.includes(index)) {
                            if(parseInt(value)) value = parseInt(value);
                            else value = value.replace(/(\r|"|')/g, '').replace(/\\n/g, '\n');
                            fileObj[key] = value;
                        }
                    }
                }
            })
            resolve(fileObj);
         })
    });
}*/
const fs = require('fs');
const YAML = require('yaml');
module.exports = function (fileName) {
    return new Promise((resolve) => {
        try {
            resolve(YAML.parse(fs.readFileSync(fileName, 'utf-8')));
        } catch (err) {
            resolve({});
            console.log("ERROR! Config file not indented properly. Debug: " + err);
        }
    })
}