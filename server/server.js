//import apollo server class 
import { ApolloServer } from '@apollo/server';
//import from the express4 subfolder tp provide the function expressMiddleware. as apolloMiddleware is to alias it to make it clear what it does
import { expressMiddleware as apolloMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import express from 'express';
//because the schema is a separate file, we import a function to read it from the "node:fs" module where fs is short for file system. 
//There is a "promises" submodule that's nicers to use as it returns promises instead of using callbacks.
//This provides the readFile function 
import { readFile } from 'node:fs/promises';
import { authMiddleware, handleLogin } from './auth.js';
//import the resolvers object from the local module we created in the resolvers.js file
import { resolvers } from './resolvers.js';

const PORT = 9000;

const app = express();
//express uses these middleware to handle CORS(to add response headers to allow Cross-Origin requests), express.json(parses the request body into a JavaScript object), and authMiddleware(for authentication)
app.use(cors(), express.json(), authMiddleware);

app.post('/login', handleLogin);

//read the typeDefs by awaiting "readFile" and passing the file name. The second parameter is the character encoding to use when reading the file, which is 'utf8' in this case.
const typeDefs = await readFile('./schema.graphql', 'utf8');

//create an instance of this class and accept typeDefs and resolvers as parameters
const apolloServer = new ApolloServer({ typeDefs, resolvers });
//to integrate it with express, we need to start apollo server by calling the start method
await apolloServer.start();
/*we again call app.use but only apply it to a specific path and we call the apolloMiddleware function in the second position.
express will now send all requests to this path to the "apolloMiddle" so it will be handled by the Apollo GraphQL engine*/
app.use('/graphql', apolloMiddleware(apolloServer));

app.listen({ port: PORT }, () => {
  console.log(`Server running on port ${PORT}`);
  //add log message printing the GraphQL endpoint at the configured port
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
