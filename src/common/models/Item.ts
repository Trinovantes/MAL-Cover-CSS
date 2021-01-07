import { Model, DataTypes } from 'sequelize'
import { sequelize } from './db'

export enum MediaType {
    Anime = 'anime',
    Manga = 'manga',
}

interface ItemAttributes {
    id: number
    mediaType: MediaType
    malId: number
    imgUrl: string | null
}

type ItemCreationAttributes = {
    mediaType: MediaType
    malId: number
}

class Item extends Model<ItemAttributes, ItemCreationAttributes> {
    id!: number
    mediaType!: MediaType
    malId!: number
    imgUrl!: string | null
}

Item.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },

    mediaType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: Object.values(MediaType),
    },

    malId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
        },
    },

    imgUrl: {
        type: DataTypes.STRING,
        validate: {
            isUrl: true,
        },
    },
}, {
    sequelize: sequelize,
    tableName: 'Items',
    freezeTableName: true,
})

export { Item }
