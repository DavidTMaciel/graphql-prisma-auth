
import { IsEmail } from "class-validator";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { context } from "../context/context";
import { User } from "../models/users/users";
import { Context } from "vm";
import {hash, compare} from "bcryptjs";
import { v4 as uuid } from 'uuid';
import { type } from "os";

@InputType()
class UserInputData {
    @Field((type) => String)
    @IsEmail()
    email: string;

    @Field((type) => String)
    password: string;
}

@ObjectType()
class UserWithToken {
	@Field((type) => User)
	user: User;

	@Field((type) => String)
	token: string;
}

@Resolver()
export class UserResolver {
    @Query((returns) => User, { nullable: true })
        async privateInfo(
            @Arg("token",(type)=> String) token: string,
             @Ctx() ctx: context
             ): 
             Promise < User | null > {
            const dbToken = await ctx.prisma.tokens.findUnique(
                {where: {token}, 
                include:{user:true}})
            if(!dbToken) return null
            
            const {user} = dbToken;

            return user;
    }

    @Mutation((returns)=> User)
    async singUp(
        @Arg("data", (type)=> UserInputData) data: UserInputData, 
        @Ctx() ctx: Context): 
        Promise<User>{

            const hashedPassword = await hash(data.password, 10)

            return ctx.prisma.users.create({data: {...data, password: hashedPassword}})
        }
    
        @Mutation((returns)=> UserWithToken)
    async login(
        @Arg("data", (type)=>UserInputData) data: UserInputData, 
        @Ctx() ctx: Context): 
        Promise<(User & {token: string}) | null>{
            const user = await ctx.prisma.users.findUnique({
                where:{email: data.email}
            });
            if(!user) return null;
            const validation = await compare(data.password, user.password)

            if(!validation) return null;

            const createdToken = uuid();
            const token = await ctx.prisma.token.create({data: {token: createdToken}, user:{connect: {id: user.id}}});

            return {...user, token: token.token}
        }

}





    