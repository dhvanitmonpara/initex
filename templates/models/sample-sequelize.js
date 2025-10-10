import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const Sample = sequelize.define('Sample', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Sample;