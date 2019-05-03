//Include the required node modules
const crud = require('./data')
const validator = require('./validator')
const router = require('./router')
const templates = require('./engine')
const templateGlobals = require('./storage/templateGlobals.json')

//Initialize router
let guiRouter = {}
guiRouter.index = (data, callback) => {
    //console.log(path.parse(data.path))
    //path.normalize(__dirname + '/public' + )
    if (data.method == 'get') {
        const templateData = {
            title: 'Homepage',
            moto: templateGlobals.headDescription,
            welcomeText: templateGlobals.welcomeText
        }
    templates.addTemplate('home', templateData, (err, template) => {
        if (!err && template) {
            callback(200, template, 'html')
        } else {
            callback(500, undefined, 'html')
        }
    })
    } else {
        callback(405, undefined, 'html')
    }
}

guiRouter.public = (data, callback) => {
    if (data.method == 'get') {
        let assetName = data.path.replace('public/' , '').trim()
        if(data.path.indexOf('menu/') != -1){    
            assetName = assetName.replace('menu/', '').trim()
        }
        let contentType = 'plain'
        if (assetName.length > 0) {
            validator.fileChecker(assetName, 'public', (err, asset) => {
                if (!err && asset) {
                    if (assetName.indexOf('.css') != -1) {
                        contentType = 'css'
                    }
                    if (assetName.indexOf('.png') != -1) {
                        contentType = 'png'
                    }
                    if (assetName.indexOf('.jpg') != -1) {
                        contentType = 'jpg'
                    }
                    if (assetName.indexOf('.jpeg') != -1) {
                        contentType = 'jpeg'
                    }
                    if (assetName.indexOf('.ico') != -1) {
                        contentType = 'favicon'
                    }
                    callback(200, asset, contentType)
                } else {
                    callback(500)
                }
            })
        } else {
            callback(404)
        }
    } else {
        callback(405)
    }
}

guiRouter.menu = (data, callback) => {
    if (data.method == 'get') {
        crud.read('menu', 'menu', (err, menuData) => {
            if (!err && menuData) {
                const templateData = {
                    title: 'Menu',
                    pizza: menuData
                }
                templates.addTemplate('list', templateData, (err, template) => {
                    if (!err && template) {
                        callback(200, template, 'html')
                    } else {
                        callback(500, undefined, 'html')
                    }
                })    
            } else {
                console.log('Could not retrieve data')
            }
        })
    } else {
        callback(405)
    }
}

guiRouter.singlePizza = (data, callback) => {
    if (data.method == 'get') {
        const templateData = {}
        crud.read('menu', 'menu', (err, menuData) => {
            if (!err && menuData) {
                let requestedPizza = data.path.toLowerCase().split('/')
                let pizzaName = requestedPizza.pop()
                for (const pizza in menuData) {
                    if (pizza.toLowerCase().replace(' ', '') == pizzaName) {
                            templateData.title =  menuData[pizza].name,
                            templateData.name = menuData[pizza].name,
                            templateData.price = menuData[pizza].price,
                            templateData.weight = menuData[pizza].weight,
                            templateData.urlName = menuData[pizza].urlName.toLowerCase()
                        crud.read('menu', 'description', (err, description) => {
                            if (!err && description) {
                                templateData.description = description[pizza]
                                templates.addTemplate('pizza', templateData, (err, template) => {
                                    if (!err && template) {
                                        callback(200, template, 'html')
                                    } else {
                                        callback(500, undefined, 'html')
                                    }
                                }) 
                            } else {
                                console.log('Could not retrieve description data')
                            }
                        })
                    }
                }
            } else {
                console.log('Could not retrieve data')
            }
        })
    } else {
        callback(405)
    }
}
guiRouter.addToCart = (data, callback) => {
    if(data.method == 'post') {
        crud.read('carts', data.headers.token, (err, cart) => {
            if (err) {
                let cart = {}
        cart[data.reqBody.name] = data.reqBody.qty
                crud.create('carts', data.headers.token, cart, err => {
                    !err ? callback(200) : callback(400)
                })  
            } else {
                if(cart[data.reqBody.name]){
                    cart[data.reqBody.name] += data.reqBody.qty
                } else {
                    cart[data.reqBody.name] = data.reqBody.qty
                }
                crud.update('carts', data.headers.token,cart, err => {
                    !err ? callback(200) : callback(500)
                })
            }
        })
       
    //    crud.read('users')
    } 
    else {
        callback(405)
    }
}
guiRouter.getCart = (data, callback) => {
    let cookie = data.headers.cookie.split('=')
    if (data.method == 'get') {
        crud.read('carts', cookie[1], (err, cartData) => {
            if (!err && cartData) {
                crud.read('menu', 'menu', (err, menuData) => {
                    if (!err && menuData) {
                        const templateData = {
                            title: 'Cart',
                            heading: 'My Cart'
                        }
                        let total = 0
                        templateData.pizza = {}
                        for (const pizza in cartData) {
                            if (cartData.hasOwnProperty(pizza)) {
                                templateData.pizza[pizza] = {
                                    name: pizza, 
                                    qty: cartData[pizza], 
                                    price: menuData[pizza].price, 
                                    total: parseFloat(
                                        (parseFloat((cartData[pizza]).toFixed(2)) * 
                                        parseFloat((menuData[pizza].price).toFixed(2)))
                                        .toFixed(2))
                                }
                                total += templateData.pizza[pizza].total
                            }
                        }
                        templateData.grandTotal = total
                        console.log(templateData)
                        templates.addTemplate('cart', templateData, (err, template) => {
                            if (!err && template) {
                                callback(200, template, 'html')
                            } else {
                                callback(500, undefined, 'html')
                            }
                        })
                    } else {
                        callback(500, {'Error': 'Could not retreive the menu'})
                    }
                })  
            } else {
                callback(404, {'Error': 'Could not find a cart with such ID'})
            }
        })
    } else {
        callback(405)
    }
}
guiRouter.clearCart = (data, callback) => {
    if (data.method == 'delete') {
        crud.delete('carts', data.headers.token, err => {
            if (!err) {
                callback(200)
            } else {
                callback(500, {'Error': 'Could not delete the specified cart'})
            }
        })
    } else {
        callback(405)
    }
}
guiRouter.removeFromCart = (data, callback) => {
    console.log(data)
    const cartName = data.headers.token
    crud.read('carts', cartName, (err, cart) => {
        if (!err && cart) {
            // let newCart = 
            delete cart[data.reqBody.name]
            crud.update('carts', cartName, cart, err => {
                if (!err) {
                    callback(200)
                } else {
                    callback(500)
                }
            })
        } else {
            callback(400)
        }
    })
}
guiRouter.purchase = (data, callback) => {
    if (data.method == 'post') {
        crud.read('tokens', data.headers.token, (err, tokenData) => {
            if (!err && tokenData) {
                const order = {
                    phone: tokenData.phone,
                    token: data.headers.token,
                    orderItems: data.reqBody.data
                }
                router.order.post(order, res => {
                    if (res) {
                        // console.log(res)
                    } else {
                        
                    }
                })
            } else {
                console.log(err)
            }
        })
        //console.log(data)
        callback(200)
    } else {
        callback(405)
    }
}
module.exports = guiRouter