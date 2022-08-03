import mongoose from "mongoose";
import { User, CheckList } from "../models/schema";
import { APIGatewayEvent } from "aws-lambda";
import { getBody, getUser } from "../utils";
import { connect } from "../models";
import { v4 as uuidv4 } from 'uuid';

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

export async function createCheckList(event: APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })

    const { name } = getBody(event);
    if (!name) needMoreInfo()

    await connect()

    const uuid = uuidv4()

    await CheckList.create({
        uuid,
        userId: user._id, 
        name,
        createdAt: new Date(),
        updatedAt: new Date()
    })

    return createResponse(200, { uuid })
}

export async function getCheckLists(event: APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })

    await connect()

    const checklists = await CheckList.find({userId: user._id});
    const editedChecklists = checklists.map(e => ({
        uuid: e.uuid,
        name: e.name,
        userId: e.userId,
        checks: e.checks,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt
    }))

    return createResponse(200, editedChecklists)
}

export async function getCheckList(event: APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })

    const uuid = event?.pathParameters?.uuid || ''
    if (!uuid) return needMoreInfo()

    await connect()

    const checklist = await CheckList.findOne({uuid, userId: user._id});
    if (!checklist) return createResponse(404, {code: 'not_found'})

    const editedChecklist = {
        uuid: checklist.uuid,
        name: checklist.name,
        userId: checklist.userId,
        checks: checklist.checks,
        createdAt: checklist.createdAt,
        updatedAt: checklist.updatedAt
    }

    return createResponse(200, editedChecklist)
}

export async function patchCheckList(event: APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })

    const uuid = event?.pathParameters?.uuid || ''
    const { name } = getBody(event);

    if (!uuid) return needMoreInfo()

    const eventList = await CheckList.findOne({uuid, userId: user._id})
    if (!eventList) return createResponse(404, { code: 'not_found' })

    const update: any = {}
    if (name) update.name = name
    update.updatedAt = new Date()

    const result = await CheckList.findOneAndUpdate({
        uuid,
        userId: user._id
    }, update, {new: true})

    if (!result) return createResponse(400)

    const editedChecklist = {
        uuid: result.uuid,
        name: result.name,
        userId: result.userId,
        checks: result.checks,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
    }

    return createResponse(200, editedChecklist)
}

export async function createCheck(event: APIGatewayEvent) {
    const user = await getUser(event);
    if (!user) return createResponse(400, { code: 'wrong_token' })

    const uuid = event?.pathParameters?.uuid || ''
    const { title, content } = getBody(event);
    if (!uuid || !title) return needMoreInfo()

    
    
}