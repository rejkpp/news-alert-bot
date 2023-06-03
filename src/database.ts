import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db/database.sqlite'
});

class Article extends Model {}
Article.init({
  title: DataTypes.STRING,
  link: DataTypes.STRING
}, { sequelize, modelName: 'article' });

class Keyword extends Model {}
Keyword.init({
  word: DataTypes.STRING
}, { sequelize, modelName: 'keyword' });

export { sequelize, Article, Keyword };
