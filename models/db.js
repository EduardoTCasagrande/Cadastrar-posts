const Sequelize  = require('sequelize');

//config conexao db
const sequelize = new Sequelize('dbpostagens', 'root', 'admin', {
    host: "localhost",
    dialect: "mysql"
});

module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
}
