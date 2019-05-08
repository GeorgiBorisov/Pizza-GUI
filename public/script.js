const doc = document

const close = doc.getElementsByClassName('close-modal')
const credentials = doc.getElementsByClassName('credentials')

let selected

Array.from(credentials).forEach((el) => {
    el.addEventListener('click', (e) => {
        selected = el.children[0].text.toLowerCase()
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
        doc.getElementsByClassName(e.path[0].id)[0].classList.toggle('hidden')
    })
})

if(doc.getElementById('edit')) {
    doc.getElementById('edit').addEventListener('click', (e) => {
        app.getUser()
        selected = e.path[0].id
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
        doc.getElementsByClassName(e.path[0].id)[0].classList.toggle('hidden')
    })
}    

Array.from(close).forEach((el) => {
    el.addEventListener('click', () => {
        doc.getElementById(el.parentNode.childNodes[3].id).reset()
        doc.getElementsByClassName(selected)[0].classList.toggle('hidden')
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
    })
})

if(doc.getElementsByClassName('quantity')[0]){
    doc.getElementsByClassName('add')[0].addEventListener('click', () => {
        let quantity = Number(doc.getElementsByClassName('quantity')[0].innerHTML)
        if(quantity <= 98) {
            doc.getElementsByClassName('quantity')[0].innerHTML = ++ quantity
        }
    })
    doc.getElementsByClassName('remove')[0].addEventListener('click', () => {
        let quantity = Number(doc.getElementsByClassName('quantity')[0].innerHTML)
        if (quantity >= 2) {
            doc.getElementsByClassName('quantity')[0].innerHTML = -- quantity
        }
    })
    doc.getElementsByClassName('add-to-cart')[0].addEventListener('click', () => {
        const quantity = Number(doc.getElementsByClassName('quantity')[0].innerHTML)
        const pizza = {
            name: doc.getElementsByClassName('pizza-name')[0].innerHTML,
            price: doc.getElementsByClassName('pizza-price')[0].innerHTML,
            qty: quantity
        }
        fetch(`${app.conf.baseUrl}addToCart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': `${app.conf.sessionToken.tokenId}`
            },
            body: JSON.stringify(pizza)
        }).then(res => {
            if(res.ok) {
                app.message('primary', 'Added to cart!')
            }
        }).catch(err => {console.log(err)})
    })
}
//Remove items from a cart and update the cart after
if(doc.getElementsByClassName('cart')){
    const cartItems = doc.getElementsByClassName('cart-remove-item')
    const cart = doc.getElementsByClassName('cart')[0]
    Array.from(cartItems).forEach((item) => {
        item.addEventListener('click', () => {
            const toBeRemoved = item.parentElement.parentElement
            const dataToRemove = {
                name: toBeRemoved.children[0].innerHTML,
                qty: toBeRemoved.children[1].innerHTML.slice(1)
            }
            const grand = doc.getElementsByClassName('grand')[0].innerHTML.split(' ')
            const toSubtract = toBeRemoved.children[3].innerHTML.split(' ')
            cart.removeChild(toBeRemoved)
            let newTotal = parseFloat(grand[1]) - parseFloat(toSubtract[1])
            doc.getElementsByClassName('grand')[0].innerHTML = '$ ' + newTotal.toFixed(2)
            fetch(`${app.conf.baseUrl}/removeFromCart`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': `${app.conf.sessionToken.tokenId}`
                },
                body: JSON.stringify(dataToRemove)
            }).catch(err => {console.log(err)})
        })
    })
}
//Purchase the items present in the user's cart
if(doc.getElementsByClassName('purchase').length > 0){
    doc.getElementsByClassName('purchase')[0].addEventListener('click', () => {
        let order = {
            data: {}
        }
        const pizzas = doc.getElementsByClassName('cart-item-wrapper')
        Array.from(pizzas).forEach((item) => {
            console.log(item.children)
            order.data[item.children[0].innerHTML] = item.children[1].innerHTML.slice(1)
        })
        fetch(`${app.conf.baseUrl}purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': `${app.conf.sessionToken.tokenId}`
            },
            body: JSON.stringify(order)
        }).then(res => {
            res.ok ? console.log('OK') : console.log('ERROR')
        }).catch(err => {console.log(err)})
        //console.log(doc.getElementsByClassName('cart-item-wrapper')[0].children)
    })
}

if (doc.getElementById('delete')) {
    doc.getElementById('delete').addEventListener('click', (e) => {
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
        doc.getElementsByClassName('delete')[0].classList.toggle('hidden')
        selected = e.path[0].id
    })
}

const app = {}
//Send a flash message to the user
app.message = (type, msgTxt) => {
    let msg = doc.createElement('div')
    msg.classList.add(`alert`, `alert-${type}`)
    msg.innerHTML = msgTxt
    doc.getElementsByClassName('about-pizza')[0].appendChild(msg)
    doc.getElementsByClassName('alert')[0].addEventListener('click', fadeOut())
    return
}
//Messages fade out effect
const fadeOut = () => {
    setTimeout(()=> {
        const target = doc.getElementsByClassName('alert')[0]
        const effect = setInterval(() => {
            if (!target.style.opacity) {
                target.style.opacity = 1
            }
            if (target.style.opacity > 0) {
                target.style.opacity -= 0.1
            } else {
                let message = doc.getElementsByClassName('alert')[0]
                message.parentNode.removeChild(message)
                clearInterval(effect)
            }
        }, 80)
    }, 3000)
   
}

app.conf = {
    sessionToken : false,
    baseUrl: 'http://127.0.0.1:3030/'
}

app.client = {}
//handle requests from forms
app.client.req = (headers, path, method, queryStrObj, reqBody, callback) => {
    //Acceptable query methods
    const reqMethods = ["POST", 'GET', 'PUT', 'DELETE']
    //Check the validity of the incomming data
    headers = typeof(headers) == 'object' && 
        headers !== null ? headers : {}
    path = typeof(path) == 'string' ? path : '/'
    method = typeof(method) == 'string' && 
        reqMethods.includes(method.toUpperCase())
        ? method.toUpperCase() : 'GET'
    queryStrObj = typeof(queryStrObj) == 'object' &&
        queryStrObj !== null ? queryStrObj : {}
    reqBody = typeof(reqBody) == 'object' &&
        reqBody !== null ? reqBody : {}
    callback = typeof(callback) == 'function' ?
        callback : false
    let reqUrl = path
    if(method == 'GET') {
        reqUrl += '?'
    }
    let count = 0 
    //Inirialize header object
    const reqHeaders = {}
    //Set the headers
    reqHeaders['Content-Type'] = 'application/json'
    for (const header in headers) {
        reqHeaders.header = headers[header]
    }
    if (app.conf.sessionToken) {
        reqHeaders['token'] = app.conf.sessionToken.tokenId
    }
    //Create the queqy string
    for (const queryKey in queryStrObj) {
        count ++
        if (count > 1) {
            reqUrl += '&'
        }
        reqUrl += queryKey + '=' + queryStrObj[queryKey]
    }
    //Make the AJAX query
    fetch(reqUrl, {
        method: method,
        headers: reqHeaders,
        body: JSON.stringify(reqBody)
    //Handle the AJAX response
    }).then(response => {
        response.json()
        .then(data => {
            callback(response.status, data)
        })
    })
}
//Set event listeners to all forms
//If an event listener is triggered get the form data
app.bindForms = () => {
    if (doc.querySelectorAll('form')) {
        let forms = doc.querySelectorAll('form')
        forms.forEach((el) => {
            el.addEventListener('submit', function(e) {
                e.preventDefault()
                let id = this.id
                let path = this.action
                let method = this.method.toUpperCase()
                let request = {}
                let elements = this.elements
                for(let i = 0; i < elements.length; i++){
                    if(elements[i].type !== 'submit'){
                        request[elements[i].name] = elements[i].value
                    }
                }
                if(id == 'upd'){
                    method = 'PUT'
                } else if (id == 'del') {
                    method = 'DELETE'
                }
                //Send the AJAX request
                app.client.req(undefined, path, method, undefined, request, (statusCode, response) => {
                    if(statusCode !== 200 && statusCode !== 201) {
                        console.log(response.Error)
                    } else {
                        app.responseHandler(id, request, response)
                    }
                })
            })
        })
    }
}
//Handle form response
app.responseHandler = (id, req, res) => {
    let credentials = {
        'phone': req.phone,
        'password': req.password
    }
    doc.getElementById(id).reset()
    if(id == 'reg') {
        app.client.req(undefined, 'api/tokens', 'POST', undefined, credentials, (status, response) => {
            if (status !== 200 && status !== 201 && status !== 204) {
                console.log('error' + status)
            } else {
                doc.getElementsByClassName(selected)[0].classList.toggle('hidden')
                app.loggedIn(response)
            }
        })
        //Handle response from login form
    } else if (id == 'log') {
        doc.getElementsByClassName(selected)[0].classList.toggle('hidden')
        app.loggedIn(res)
        //Handle response from profile update form
    } else if (id == 'upd') {
        doc.getElementsByClassName(selected)[0].classList.toggle('hidden')
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
        //Handle response from profile delete form
    } else if (id == 'del') {
       app.logout()
       location.href = '/'
    }
}
//Log the user in
app.loggedIn = (token) => {
    //Get the token after logging in
    app.setSessionToken(token)
    if(doc.getElementsByClassName('welcome')[0] !== undefined){
        doc.getElementsByClassName('welcome')[0].classList.toggle('hidden')
        doc.getElementsByClassName('logged-menu-wrapper')[0].classList.toggle('hidden')
    }
    if(!doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')){
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
    }
    doc.getElementsByClassName('loged')[0].classList.toggle('hidden')
    let logFields = doc.getElementsByClassName('credentials')
    for (let i = 0; i < logFields.length; i++) {
        logFields[i].classList.toggle('hidden')
    }
}
//Set the session token
app.setSessionToken = (token) => {
    doc.cookie = `token=${token.tokenId}; expires=${token.expires}`
    app.conf.sessionToken = token;
    let tokenString = JSON.stringify(token)
    sessionStorage.setItem('token',tokenString)
}
//Get the session token
app.getSessionToken = () => {
    const tokenStr = sessionStorage.getItem('token') 
    if (tokenStr && typeof(tokenStr) == 'string') {
        try {
            const token = JSON.parse(tokenStr)
            //Check if the available session token is still valid
            fetch(`${app.conf.baseUrl}api/tokens?id=${token.tokenId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                res.json().then(data => {
                    if(data.tokenId){
                        app.conf.sessionToken = data.tokenId
                        app.loggedIn(data)
                    } else {
                        sessionStorage.clear()
                        app.conf.sessionToken = false
                    }
                })
            }).catch(err => {sessionStorage.clear()})
        } catch (e) {
            app.conf.sessionToken = false

        }
    }
}
//Get user profile information in order to update the profile of the user
app.getUser = () => {
    const session = sessionStorage.getItem('token')
    const token = JSON.parse(session)
    const credentials = {phone: token.phone}
    const phone = credentials.phone
    fetch(app.conf.baseUrl + `api/users?phone=${phone}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'token': `${app.conf.sessionToken.tokenId}`
        }
    })
    .then(response => {
        response.json().then(data => {
            doc.getElementsByName('firstNameUpdate')[0].value = data.firstName
            doc.getElementsByName('lastNameUpdate')[0].value = data.lastName
            doc.getElementsByName('phoneUpdate')[0].value = data.phone
            doc.getElementsByName('addressUpdate')[0].value = data.address
            doc.getElementsByName('emailUpdate')[0].value = data.validEmail
        }) 
    })
           
}
//Log the useer out and clear the cookies and session storage
app.logout = () => {
    const tokenStr = sessionStorage.getItem('token')
    const token = JSON.parse(tokenStr)
    fetch(`${app.conf.baseUrl}/clearCart`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'token': `${app.conf.sessionToken.tokenId}`
        },
        data: token.tokenId
    })
    let request = { id: token.tokenId }
    sessionStorage.clear()
    doc.cookie = `token=${token.tokenId}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    app.client.req(undefined, 'api/tokens', 'DELETE', undefined, request, err => {
        if (!err) {
            doc.getElementsByClassName('welcome')[0].classList.toggle('hidden')
            doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
            doc.getElementsByClassName('logged-menu-wrapper')[0].classList.toggle('hidden')
            doc.getElementsByClassName('loged')[0].classList.toggle('hidden')
            let logFields = doc.getElementsByClassName('credentials')
            for (let i = 0; i < logFields.length; i++) {
                logFields[i].classList.toggle('hidden')
            }
        } else {
            console.log(err)
        }
    })
}
//Get the session token if it is present
app.getSessionToken()

window.onload = () => { 
    //If cookies are present, but token is not, clear the cookies
    if(!app.conf.sessionToken){
        doc.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`
    }
    app.bindForms() 
    doc.getElementsByClassName('loged')[0].addEventListener('click', () => {
        app.logout()
    })
}
//Clear the cookies and session storage after the browser is closed
if(window.closed){
    sessionStorage.clear()
    doc.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}