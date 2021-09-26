const { ApolloServer, gql } = require("apollo-server");
const db = require("./db");

// TODO:
// Create a scalar type
// Create a subscription
// Use context menu

const typeDefs = gql`
  type Query {
    movies: [Movie]
    findmovie(id: ID!): Movie
    characters: [Character]
    findcharacter(id: ID!): Character
    actors: [Actor]
    findactor: Actor
  }

  type Movie {
    id: ID
    title: String
    releaseDate: String
    rating: Float
    status: Status
    characters: [Character]
    actors: [Actor]
  }

  enum Status {
    INTERESTING
    UNKNOWN
    BORING
    STRANGE
    FUNNY
    AMUSING
    TO_DIE_FOR
  }

  type Character {
    id: ID
    name: String
  }

  type Actor {
    id: ID
    name: String
  }

  input CharacterInput {
    id: ID
    name: String
  }

  input ActorInput {
    id: ID
    name: String
  }

  input MovieInput {
    id: ID
    title: String
    releaseDate: String
    rating: Float
    status: Status
    characters: [CharacterInput!]!
    actors: [ActorInput!]!
  }

  type Mutation {
    addMovie(input: MovieInput): Movie
    deleteMovie(id: ID!): String
    update(id: ID!): Movie
  }
`;

const resolvers = {
  Query: {
    movies: () => {
      return db.movies.list();
    },
    findmovie: (root, args, context, info) => {
      const { id } = args;
      return db.movies.get(id);
    },
    characters: () => {
      return db.characters.list();
    },
    findcharacter: (root, args, context, info) => {
      const { id } = args;
      return db.characters.get(id);
    },
    actors: () => {
      return db.actors.list();
    },
    findactor: (root, args, context, info) => {
      const { id } = args;
      return db.actors.get(id);
    },
  },
  Movie: {
    characters: (root) => {
      const characterId = root.characters;
      const characterList = characterId.map((d) => db.characters.get(d.id));
      return characterList;
    },
    actors: (root) => {
      const actorId = root.actors;
      const actorList = actorId.map((d) => db.actors.get(d.id));
      return actorList;
    },
  },
  Mutation: {
    addMovie: (root, args, context, info) => {
      let addedCharacters;
      let addedActors;
      const newMovie = args.input;
      const { title, characters, actors } = args.input;
      const movieTitles = db.movies.list().map((d) => d.title);

      // make sure to add movies that don't already exist
      if (!movieTitles.includes(title)) {
        if (characters || characters.length > 0) {
          const charactersList = db.characters.list().map((d) => d.name);
          const characterListLength = charactersList.length;

          // ensures doesn't add characters that already exist
          characters
            .filter((d) => !charactersList.includes(d.name))
            .forEach((e, index) => {
              if (!charactersList.includes(e.name)) {
                db.characters.create({
                  id: `char-${characterListLength + index}`,
                  name: e.name,
                });
              }
            });

          addedCharacters = characters.map((d) => {
            const characterName = d.name;
            const charactersDB = db.characters.list(); // get entire list
            const characterInfo = charactersDB.find(
              (e) => e.name === characterName
            );
            return characterInfo;
          });
        }

        if (actors || actors.length > 0) {
          const actorsList = db.actors.list().map((d) => d.name);
          const actorListLength = actorsList.length;
          // ensures doesn't add actors that already exist
          actors
            .filter((d) => !actorsList.includes(d.name))
            .forEach((e, index) => {
              if (!actorsList.includes(e.name)) {
                db.actors.create({
                  id: `act-${actorListLength + index}`,
                  name: e.name,
                });
              }
            });

          addedActors = actors.map((d) => {
            const actorName = d.name;
            const actorsDB = db.actors.list(); // get entire list
            const actorInfo = actorsDB.find((e) => e.name === actorName);
            return actorInfo;
          });
        }

        const movieId = db.movies.create({
          ...newMovie,
          characters: addedCharacters,
          actors: addedActors,
        });
        return db.movies.get(movieId);
      }
      return {};
    },
    deleteMovie: (root, args, context, info) => {
      const { id } = args;
      const movie = db.movies.get(id);
      db.movies.delete(id);
      return `The movie "${movie.title}" has been deleted`;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`The server has begun ${url} 😎`);
});
