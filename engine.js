const validator = require('./validator')
const templates = {}

templates.addTemplate = (file, data, callback) => {
    data = typeof(data) == 'object' && data != null ? data : {}
    validator.fileChecker('header', 'templates', (err, header) => {
        if (!err && header) {
            validator.fileChecker('footer', 'templates', (err, footer) => {
                if (!err && footer) {
                    validator.fileChecker(file, 'templates', (err, template) => {
                        if (!err && template) {
                            const completeTemplate = header + template + footer
                            const assembledTemplate = templates.embed(completeTemplate, data)
                            callback(false, assembledTemplate)
                        } else {
                            callback(500, 'Could not render template')
                        }
                    })
                } else {
                    callback(500, undefined, 'html')
                }
            })
        } else {
            callback(500, undefined, 'html')
        }
    })
}

templates.embed = (template, data) => {
    for (const key in data) {
        template = template.replace(`{{${key}}}`, data[key])
        if(typeof(data[key]) === 'object') {
            let startLabel = `<@${key}@>`
            let endLabel = `<#${key}#>`
            let listPart = template.substring(template.indexOf(startLabel) + startLabel.length, template.indexOf(endLabel))
            let oldListPart = template.substring(template.indexOf(startLabel), template.indexOf(endLabel) + endLabel.length)
            let listData = data[key]
            let listTemplate = ''
            for (const listKey in listData) {
                let itemList = listData[listKey]
                let partial = listPart
                for (const item in itemList) {
                    let searchedWord = `{{${item}}}`
                    partial = partial.replace(new RegExp(searchedWord, 'gi'), itemList[item])
                }
                listTemplate += partial            
            }
            template = template.replace(oldListPart, listTemplate)
        }
    }
    return template
}

module.exports = templates;