#!/usr/bin/env node --harmony

var fs = require('fs')
var path = require('path')
var findFilesInDir = require('./libs/findFilesInDir.js')
var originalCwd = process.cwd()

var subcommand = ''; 

if (typeof process.argv[1] != 'undefined' && typeof process.argv[2] != 'undefined') {
  subcommand = process.argv[2]
}

if (subcommand == '') {
  console.log('Possible commands: ');
  console.log('- storyblok-ds-convert xml')
  console.log('- storyblok-ds-convert trados')
  console.log('- storyblok-ds-convert xml-csv')
  console.log('- storyblok-ds-convert trados-csv')
}

if (subcommand == 'trados' || subcommand == 'xml') {
  var results = findFilesInDir(originalCwd, '.csv')

  for (var index = 0, max = results.length; index < max; index++) {
    var fileToRead = results[index]
    
    fs.readFile(fileToRead, 'utf8', (err, data) => {
      var fileName = path.basename(fileToRead, path.extname(fileToRead))
      
      if (err) {
        return console.error(err)
      }

      var tags = '';    
      var rows = data.split('\n');
      for (var i = 0, max = rows.length; i < max; i++) {
        var row = rows[i];

        var splitted = row.split(',')
        if (splitted.length == 2) {
          var key = splitted[0]
          var value = splitted[1]
          if (key != 'name') { 
            tags += `<tag id="${key}" type="STRING"><text><![CDATA[${value}]]></text></tag>`
          }
        }
      }

      var content = `<?xml version="1.0" encoding="UTF-8"?><page filename="${fileName}" id="${fileName}"><name>${fileName}</name><tags>${tags}</tags></page>`      

      fs.writeFile(`./${fileName}.xml`, content, 'utf8', function (err) {
        if (err) {
          return console.log(err)
        }
        console.log('Convert done.')
      })
    })
  }
}

if (subcommand == 'xml-csv' || subcommand == 'trados-csv') {
  var results = findFilesInDir(originalCwd, '.xml')

  for (var index = 0, max = results.length; index < max; index++) {
    var fileToRead = results[index]
    
    fs.readFile(fileToRead, 'utf8', (err, data) => {
      var fileName = path.basename(fileToRead, path.extname(fileToRead))
      
      if (err) {
        return console.error(err)
      }

      var ids = data.match(new RegExp(/id="([^"]*)"/g))
      var contents = data.match(new RegExp(/<!\[CDATA\[([^\]]*)/g))

      var content = 'name,value\r\n';

      for (var index = 1, max = ids.length; index < max; index++) {
        content += [ids[index].substring(4, ids[index].length - 1)] + ',' + contents[index - 1].substring(9, contents[index - 1].length) + '\r\n'
      }
      
      // var content = `<?xml version="1.0" encoding="UTF-8"?><page filename="${fileName}" id="${fileName}"><name>${fileName}</name><tags>${tags}</tags></page>`      

      fs.writeFile(`./${fileName}.csv`, content, 'utf8', function (err) {
        if (err) {
          return console.log(err)
        }
        console.log('Convert done.')
      })
    })
  }
}
