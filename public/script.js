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
        const grand = doc.getElementsByClassName('grand')[0]
        const toSubtract = toBeRemoved.children[0].innerHTML
        cart.removeChild(toBeRemoved)
        console.log(grand.innerHTML)
        console.log(toSubtract[1])
        grand.innerHTML = parseFloat(grand.innerHTML) - parseFloat(toSubtract[1])
        fetch(`${app.conf.baseUrl}/removeFromCart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': `${app.conf.sessionToken.tokenId}`
            },
            body: JSON.stringify(dataToRemove)
        }).then(res => {
            if(res.ok) {
                app.message('primary', 'Added to cart!')
            }
        }).catch(err => {console.log(err)})
        console.log(dataToRemove.qty)
    })
})
}


const app = {}

app.message = (type, msgTxt) => {
    let msg = doc.createElement('div')
    msg.classList.add(`alert`, `alert-${type}`)
    msg.innerHTML = msgTxt
    doc.getElementsByClassName('about-pizza')[0].appendChild(msg)
    doc.getElementsByClassName('alert')[0].addEventListener('click', fadeOut())
    return
}

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

app.client.req = (headers, path, method, queryStrObj, reqBody, callback) => {
    const reqMethods = ["POST", 'GET', 'PUT', 'DELETE']
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
    const reqHeaders = {}
    reqHeaders['Content-Type'] = 'application/json'
    for (const header in headers) {
        reqHeaders.header = headers[header]
    }
    if (app.conf.sessionToken) {
        reqHeaders['token'] = app.conf.sessionToken.tokenId
    }
    for (const queryKey in queryStrObj) {
        count ++
        if (count > 1) {
            reqUrl += '&'
        }
        reqUrl += queryKey + '=' + queryStrObj[queryKey]
    }
    fetch(reqUrl, {
        method: method,
        headers: reqHeaders,
        body: JSON.stringify(reqBody)
    }).then(response => {
        response.json()
        .then(data => {
            callback(response.status, data)
        })
    })
}

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
                }
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
    } else if (id == 'log') {
        doc.getElementsByClassName(selected)[0].classList.toggle('hidden')
        app.loggedIn(res)
    } else if (id == 'upd') {
        doc.getElementsByClassName(selected)[0].classList.toggle('hidden')
        doc.getElementsByClassName('auth-wrapper')[0].classList.toggle('hidden')
    }
}

app.loggedIn = (token) => {
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
    doc.querySelector('input').value = ''
}

app.setSessionToken = (token) => {
    doc.cookie = `token=${token.tokenId}; expires=${token.expires}`
    app.conf.sessionToken = token;
    let tokenString = JSON.stringify(token)
    sessionStorage.setItem('token',tokenString)
}

app.getSessionToken = () => {
    const tokenStr = sessionStorage.getItem('token') 
    if (typeof(tokenStr) == 'string') {
        try {
            const token = JSON.parse(tokenStr)
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

app.getSessionToken()

window.onload = () => { 
    app.bindForms() 
    doc.getElementsByClassName('loged')[0].addEventListener('click', () => {
        app.logout()
    })
    if(!app.conf.sessionToken){
        doc.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
}

if(window.closed){
    sessionStorage.clear()
    doc.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}