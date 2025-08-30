import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize';

const Sample = sequelize.define('Sample', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Sample;