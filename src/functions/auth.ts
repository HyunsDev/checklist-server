import mongoose from "mongoose";
import { randomBytes, pbkdf2Sync } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { User } from "../models/schema";
import { APIGatewayEvent } from "aws-lambda";
import { getBody, getUser } from "../utils";
import { connect } from "../models";

const createResponse = (status: number = 200, body?: Object) => ({
    statusCode: status,
    body: body && JSON.stringify(body),
    headers: {
        "Access-Control-Allow-Origin": "*",
        'Access-Control-Allow-Credentials': false,
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods":"OPTIONS,POST,GET,PUT,DELETE"
    }
})

const needMoreInfo = () => createResponse(403, { code: 'need_more_info' })

/**
 * POST /auth/signup
 * @param event 
 */
export async function createAccount(event: APIGatewayEvent) {
    const { id, password, name } = JSON.parse(event.body || '');
    if (!id || !password || !name) return needMoreInfo()

    const salt = randomBytes(64).toString('base64')
    const hashedPassword = pbkdf2Sync(password, salt, 8, 64, 'sha512').toString('base64')

    await connect()
    if (await User.findOne({ id })) return createResponse(202, { code: 'already_account_exist' })

    await User.create({
        id,
        password: hashedPassword,
        passwordSalt: salt,
        name: name,
        img: process.env.USER_DEFAULT_IMG
    })

    return createResponse()
}

export async function login(event: APIGatewayEvent) {
    const { id, password } = getBody(event)
    if (!id || !password) return needMoreInfo()

    await connect()
    const user = await User.findOne({ id })
    if (!user) return createResponse(404, { code: "user_not_found" })

    const hashedPassword = pbkdf2Sync(password, user.passwordSalt, 8, 64, 'sha512').toString('base64')
    if (hashedPassword !== user.password) return createResponse(403, { code: "wrong_password" })

    const token = jwt.sign({
        _id: user._id,
        id: user.id,
    }, process.env.JWT_SECRET, {
        issuer: 'checklist.hyuns.dev',
        subject: 'user'
    })

    return createResponse(200, { token })
}

export async function deleteAccount(event:APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })
    await User.findByIdAndRemove(user._id);
    return createResponse(204)
}

export async function patchAccount(event:APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })

    const { password, name, img } = getBody(event)
    await connect()

    const update: any = {}
    if (name) update.name = name
    if (img) update.img = img
    if (password) {
        const salt = randomBytes(64).toString('base64')
        const hashedPassword = pbkdf2Sync(password, salt, 8, 64, 'sha512').toString('base64')
        update.userPassword = hashedPassword
        update.userPasswordSalt = salt
    }

    await User.findByIdAndUpdate(user._id, update)
    return createResponse(204)
}

export async function getAccount(event:APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })
    return createResponse(200, user)
}