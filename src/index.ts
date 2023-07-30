import 'reflect-metadata';
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { context } from "./context/context";
import { UserResolver } from "./roots";
import { error } from 'console';

const app = async () => {
    const schema = await buildSchema({ resolvers: [UserResolver] });

    new ApolloServer({ schema, context }).listen({ port: 4000 }).then(() => {console.log('Server is running')}).catch((error)=>{
        console.log(error);
    });
}

app();