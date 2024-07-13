const bcrypt = require('bcrypt')
const config = require('./config')

const hashPassword = async (password) => {
    return await bcrypt.hash(password, config.security.hash.saltRounds) 
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

module.exports = {
    hashPassword, 
    comparePassword
}