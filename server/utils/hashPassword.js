const bcrypt = require('bcrypt');
/**
* Hacher un mot de passe
* @param {string} password - Mot de passe en clair
* @returns {Promise<string>} Mot de passe haché
*/
const hashPassword = async (password) => {
const saltRounds = 10; // Coût du hachage (10 est un bon compromis sécurité/performance)
return await bcrypt.hash(password, saltRounds);
};
/**
* Comparer un mot de passe avec son hash
* @param {string} password - Mot de passe en clair
* @param {string} hashedPassword - Mot de passe haché
* @returns {Promise<boolean>} true si les mots de passe correspondent
*/
const comparePassword = async (password, hashedPassword) => {
return await bcrypt.compare(password, hashedPassword);
};
module.exports = {
hashPassword,
comparePassword
};