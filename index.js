//Include the required NodeJS modules
const http = require('http')
const url = require('url')
const {StringDecoder} = require('string_decoder')
//Include additinal hand crafted modules
const apiRouter = require('./router')
const guiRouter = require('./guiRouter')
const helpers = require('./helpers')
const config = require('./config')
const checker = require('./checker')
//Create the server and process the requests
const server = http.createServer((req, res) => {  
    //Get the request parameters
    let urlParsed = url.parse(req.url, true)
    let path = urlParsed.pathname
    let trimmedPath = path.replace(/^\/+|\/+$/g, '')
    let method = req.method.toLowerCase()
    let headers = req.headers
    let queryString = urlParsed.query
    //Initialize decoder
    let decoder = new StringDecoder('utf-8')
    //Initialize buffer
    let buffer = ''
    let singleReq = true
    //Save the request body to a buffer
    let cookie = req.headers.cookie
    if(req.url != '/' && cookie == undefined && req.url.indexOf('/public') == -1) {
        if((req.url == '/api/users' || req.url == '/api/tokens') && req.method == 'POST'){
            singleReq = true
        } else {
            singleReq = false
        }
    }
    req.on('data', data => {
        buffer += decoder.write(data)
    })
    req.on('end', () => {
        buffer += decoder.end()
        let requestedUrl = routes[trimmedPath] ? routes[trimmedPath] : routes['404']
        requestedUrl = trimmedPath.indexOf('menu/') != -1 ? guiRouter.singlePizza : requestedUrl 
        requestedUrl = trimmedPath.indexOf('public/') != -1 ? guiRouter.public : requestedUrl
        //Get the request parameters
        let requestData = {
            'path': trimmedPath,
            'query': queryString,
            'method': method,
            'headers': headers,
            'reqBody': helpers.parseJSON(buffer)
        }  
        //Call the requested URL if such exists and return status code and response
        requestedUrl(requestData, (code, reqBody, contentType) => {
            contentType = typeof(contentType) == 'string' ? contentType : 'json'
            code = typeof(code) == 'number' ? code : 200
            let reqBodyStr = ''
            if (contentType == 'json'){
                res.setHeader('Content-Type', 'application/json')
                reqBody = typeof(reqBody) == 'object' ? reqBody : {}
                reqBodyStr = JSON.stringify(reqBody)
            }
            else if (contentType == 'html') {
                res.setHeader('Content-Type', 'text/html')
                reqBodyStr = typeof(reqBody) == 'string' ? reqBody : ''
            }
            if (contentType == 'favicon') {
                res.setHeader('Content-Type', 'image/x-icon')
                reqBodyStr = typeof(reqBody) != undefined ? reqBody : ''
            }
            if (contentType == 'plain') {
                res.setHeader('Content-Type', 'text/plain')
                reqBodyStr = typeof(reqBody) != undefined ? reqBody : ''
            }
            if (contentType == 'css') {
                res.setHeader('Content-Type', 'text/css')
                reqBodyStr = typeof(reqBody) != undefined ? reqBody : ''
            }
            if (contentType == 'png') {
                res.setHeader('Content-Type', 'image/png')
                reqBodyStr = typeof(reqBody) != undefined ? reqBody : ''
            }
            if (contentType == 'jpg' || contentType == 'jpeg') {
                res.setHeader('Content-Type', 'image/jpeg')
                reqBodyStr = typeof(reqBody) != undefined ? reqBody : ''
            }
            //Check if request is valid
            if(singleReq) {
                //Send status code
                res.writeHead(code)
            } else if(!singleReq) {
                res.writeHead(307,  {'Location': '/'})
            }
            //Send response body
            res.end(reqBodyStr)
        })           
    })
//Set the server the listen to a certain port  
}).listen(config.port)
//Initiate the checking of the orders
checker.start()
console.log(`Server is running on port ${config.port}`)
//Valid URLs
const routes = {
    '': guiRouter.index,
    'public': guiRouter.public,
    'menu': guiRouter.menu,
    'addToCart': guiRouter.addToCart,
    'clearCart': guiRouter.clearCart,
    'removeFromCart': guiRouter.removeFromCart,
    'cart': guiRouter.getCart,
    'purchase': guiRouter.purchase,
    'api/users': apiRouter.users,
    'api/tokens': apiRouter.tokens,
    'api/products': apiRouter.products,
    'api/orders': apiRouter.orders,
    'api/orders/markCompleted': apiRouter.confirmOrder,
    '404': apiRouter.notFound
}
