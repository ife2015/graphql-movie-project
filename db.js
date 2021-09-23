const { DataStore } = require("notarealdb");
const store = new DataStore("./data");

module.exports = {
  movies: store.collection("movies"),
  characters: store.collection("characters"),
  actors: store.collection("actors"),
};
