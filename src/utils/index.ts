import { APIGatewayEvent } from "aws-lambda";
import mongoose from "mongoose";
import { User } from "../models/schema";
import * as jwt from 'jsonwebtoken';
import { connect } from "../models";


export async function getUser(event: APIGatewayEvent) {
    if (!event.headers?.Authorization) return false
    const token = event.headers.Authorization.replace("Bearer ","")

    let verifiedToken
    try {
        verifiedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        return false
    }

    await connect()
    const user = await User.findById(verifiedToken._id)
    if (!user) return false

    const editedUser = {
        _id: user._id,
        id: user.id,
        role: user.role,
        name: user.name,
        img: user.img
    }
    return editedUser
}

export const getBody = (event: APIGatewayEvent): { [key: string]: string } => {
    if (!event.body) return {}
    try {
        return JSON.parse(event.body)
    } catch (e) {
        if (e instanceof SyntaxError) {
            return {}
        } else {
            throw e
        }
    }
}