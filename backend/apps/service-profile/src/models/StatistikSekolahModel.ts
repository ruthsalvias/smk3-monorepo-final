import { DataTypes } from "sequelize";
import { dbProfile } from "../config/database";

const StatistikSekolahModel = dbProfile.define(
  "m_statistik_sekolah",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    label: { type: DataTypes.STRING, allowNull: false },
    nilai: { type: DataTypes.STRING, allowNull: false },
    ikon: { type: DataTypes.STRING, allowNull: true, defaultValue: "users" },
    urutan: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    freezeTableName: true,
    tableName: "m_statistik_sekolah",
  },
);

export default StatistikSekolahModel;
