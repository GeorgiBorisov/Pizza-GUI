const readline = require('readline')
const os = require('os')
const events = require('events')
class Events extends events{}
let e = new Events()
const crud = require('./data')
const config = require('./config')
const cli = {}
const width = process.stdout.columns
const separation = '='.repeat(width)

cli.validInput = str => {
    let flag = false
    let command = false
    str = typeof(str) == 'string' && str.trim().length >= 3 ? str.trim() : false
    if(str && str.indexOf('--') != -1) {
        str = str.split('--')
        command = str[0].trim()
        flag = str[1].trim()
    } else if (str) {
        command = str
    }
    if(commands[command] && !flag){
        e.emit(command)
    }else if(commands[command] && flag) {
        e.emit(command, flag)
    } else {
        console.log('Incorrect input! Try again!')
        cli.cliIO.prompt()
    }
}
cli.cliIO = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>> '
})
//Srart a CLI with e specified delay
module.exports = () => {
    setTimeout(function(){
        console.log('\x1b[32m%s\x1b[33m','Welcome to the CLI')
        cli.cliIO.prompt()

        cli.cliIO.on('line', (str) => {
            cli.validInput(str)
            // cli.cliIO.prompt()
        })

        cli.cliIO.on('exit', () => {
            process.exit(0)
        })
    }, 50)

    e.on('users', (flag) => {
        let userInfo = ''
        if(flag && typeof(flag) == 'string' && flag != 'recent') {
            cli.getList('users', (err ,profiles) => {
                if (!err && profiles) {
                    profiles.forEach(profile => {
                        crud.read('users', profile, (err, profileData) => {
                            if (!err && profileData ) {
                                if(profileData.validEmail === flag){
                                    delete profileData.hashedPass
                                    delete profileData.validEmail
                                    delete profileData.logonTime
                                    userInfo = profileData
                                    console.log('\x1b[32m%s\x1b[33m', userInfo)
                                    console.log(separation)
                                    cli.cliIO.prompt()
                                } 
                            } else {
                                console.log('Profiles could not be retrieved.')
                                cli.cliIO.prompt()
                            }
                        })
                    })
                } else {
                    console.log(err)
                    cli.cliIO.prompt()
                }
            })  
        } else if (flag && flag === 'recent') {
            cli.getList('users', (err ,profiles) => {
                if (!err && profiles) {
                    let limit = profiles.length
                    let count = 0
                    profiles.forEach(profile => {
                        crud.read('users', profile, (err, profileData) => {
                            if (!err && profileData ) {
                                if(profileData.logonTime >= Date.now() - config.checkLastDay){
                                    delete profileData.hashedPass
                                    delete profileData.validEmail
                                    delete profileData.logonTime
                                    userInfo = profileData
                                    console.log('\x1b[32m%s\x1b[33m', userInfo)
                                    console.log(separation)
                                }
                                count ++
                                if(count == limit) {
                                    cli.cliIO.prompt()
                                } 
                            } else {
                                console.log('Profiles could not be retrieved.')
                                cli.cliIO.prompt()
                            }
                        })
                    })
                } else {
                    console.log(err)
                    cli.cliIO.prompt()
                }
          })  
        } else {
            cli.getList('users', (err ,profiles) => {
                if (!err && profiles) {
                    let limit = profiles.length
                    let count = 0
                    profiles.forEach(profile => {
                        crud.read('users', profile, (err, profileData) => {
                            if (!err && profileData) {
                                delete profileData.hashedPass
                                delete profileData.email
                                delete profileData.logonTime
                                userInfo = profileData
                                console.log('\x1b[32m%s\x1b[33m', userInfo)
                                console.log(separation)
                                count ++
                                if(count == limit) {
                                    cli.cliIO.prompt()
                                }
                            } else {
                                console.log('Profiles could not be retrieved.')
                            }
                        })
                    })
                } else {
                    console.log(err)
                    cli.cliIO.prompt()
                }
            })  
        }
    })
    
    e.on('menu', () => {
        crud.read('menu', 'menu', (err, menuItems) => {
            if (!err && menuItems) {
                console.dir(menuItems)
            } else {
                console.log(err)
            }
            cli.cliIO.prompt()
        })
    })
    
    e.on('orders', (flag) => {
        cli.getList('orders', (err, orders) => {
            if (!err && orders && !flag) {
                let limit = orders.length
                let count = 0
                orders.forEach(order => {
                    crud.read('orders', order, (err, orderData) => {
                        if (!err && orderData) {
                            console.log('\x1b[34m%s\x1b[33m', `PHONE: ${order}`)
                            console.log('\x1b[34m%s\x1b[33m','ORDERS', orderData)
                            
                            console.log('\x1b[32m%s\x1b[33m',separation)
                            count ++
                            if(count == limit) {
                                cli.cliIO.prompt()
                            }
                        } else {
                            console.log('Orders could not be found')
                            cli.cliIO.prompt()
                        }
                    })
                })
            } else if (!err && orders && flag.match('[0-9]{13,}')) {
                orders.forEach(order => {
                    crud.read('orders', order, (err, orderData) => {
                        if (!err && orderData) {
                            orderIDS = Object.keys(orderData)
                            orderIDS.forEach(id => {
                                if(id == flag){
                                    console.log(`ORDER: ${id}`)
                                    console.dir(orderData[id])
                                    cli.cliIO.prompt()
                                }
                            })
                        } else {
                            console.log('Order could not be found')
                            cli.cliIO.prompt()
                        }
                    })  
                })
            } else if (!err && orders && flag === 'recent') {
                let limit = orders.length
                let count = 0
                let recent = false
                console.log('\x1b[34m%s\x1b[33m','RECENT ORDERS:')
                console.log(separation)
                orders.forEach(order => {
                    crud.read('orders', order, (err, orderData) => {
                        
                        if (!err && orderData) {
                            
                            orderIDS = Object.keys(orderData)
                            orderIDS.forEach(id => {
                                if(id >= Date.now() - config.checkLastDay){
                                    recent = true
                                    console.dir(orderData[id])
                                }
                            })
                            count ++
                            if(count == limit) {
                                if(!recent){
                                    console.log('\x1b[34m%s\x1b[33m','THERE ARE NO RECENT ORDERS')
                                }
                                console.log(separation)
                                cli.cliIO.prompt()
                            }
                        } else {
                            console.log('Order could not be found')
                            cli.cliIO.prompt()
                        }
                    })  
                })
            } else {
                console.log('Orders list could not be retrieved')
                cli.cliIO.prompt()
            }
            
        })
    })

    e.on('system', () => {
        let cpuFreq = () => {
            let cores = []
            for (const cpu in os.cpus()) {
                cores.push(os.cpus()[cpu].speed)
            }
            return cores
        }

        const system = {
            'OS type': os.type(),
            'OS platform': os.platform(),
            'Uptime (is seconds)': os.uptime(),
            'Architecture': os.arch(),
            'CPU model': os.cpus()[0].model,
            'CPU freuqency': cpuFreq(),
            'System memory': Number((os.totalmem() / 1024 / 1024 / 1024).toFixed(2)),
            'Average load': os.loadavg()
        }
        console.dir(system)
        cli.cliIO.prompt()
    })

    e.on('man', () => {
        cli.options()
    })

    e.on('help', () => {
        cli.options()
    })

    e.on('exit', () => {
        process.exit(0)
    })
}

cli.options = () => {
    const headText = ' CLI MENU '
    let padding = '='.repeat((width - headText.length) / 2 ) 
    const head = `${padding}${headText}${padding}`
    console.log(head)
    for (const command in commands) {
        if (commands.hasOwnProperty(command)) {
            padding = ' '.repeat(20 - command.length)
            console.log(`${command}${padding}${commands[command]}`)
        }
    }
    console.log(separation)
    cli.cliIO.prompt()
}

cli.getList = (type, callback) => {
    crud.list(type, (err, profiles) => {
        if (!err && profiles) {
           callback(false, profiles)
        } else {
           callback(`Couldn\'t retrieve ${type} list`, undefined)
           cli.cliIO.prompt()
        }
    })
}

const commands = {
    'man': 'Lists all available commands with a description for each one',
    'help': 'Lists all available commands with a description for each one',
    'menu': 'View the current menu',
    'orders': 'List all the orders',
    'orders --id': 'List all the data about a specific order',
    'orders --recent': 'List all the data about orders made in the last 24 hours',
    'users': 'List all the users',
    'users --id': 'List all the data about a specific user',
    'users --recent': 'List all the data about users logged in the last 24 hours',
    'system': 'Get general information about the system on which the software runs',
    'exit': 'Logout from the CLI'
}