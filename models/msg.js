'use strict';
module.exports = (sequelize, DataTypes) => {
  const Msg = sequelize.define('Msg', {
    userId: DataTypes.INTEGER,
    msg: DataTypes.STRING
  }, {});
  Msg.associate = function (models) {
    Msg.belongsTo(models.User)
  };
  return Msg;
};