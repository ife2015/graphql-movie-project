const { ApolloServer, gql } = require("apollo-server");
const db = require("./db");

const typeDefs = gql`
  type Query {
    movies: [Movie]
    findmovie(id: ID!): Movie
    characters: [Character]
    findcharacter: Character
    actors: [Actor]
    findactor: Actor
  }

  type Movie {
    id: ID!
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
    id: ID!
    name: String
  }

  type Actor {
    id: ID!
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
    title: String
    releaseDate: String
    rating: Float
    status: Status
    characters: [CharacterInput]
    actors: [ActorInput]
  }
`;

const resolvers = {
  Query: {
    movies: () => {
      return db.movies.list();
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`The server has begun ${url} 😎`);
});
