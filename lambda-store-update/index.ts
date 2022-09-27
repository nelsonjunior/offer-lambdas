import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {

    const docClient = new DocumentClient();

    console.info(`request from: ${event.path} params: ${event.pathParameters}`);

    try {

        validateRequest(event);

        const store = getStore(event.pathParameters.storeID, docClient)

        const storeUpdate = JSON.parse(event.body) as Store;

        validateStore(storeUpdate);

        const changeItem = updateStore(store, storeUpdate, docClient);

        return createResponse({
            code: 200,
            body: changeItem
        });

    } catch (error) {
        return createResponse({
            code: 400,
            message: error.message
        });
    }
}

async function updateStore(store: any, storeUpdate: Store, docClient: DocumentClient) {

    const changeItem = {
        storeID: store.storeID,
        name: storeUpdate.name,
        description: storeUpdate.description,
        latitude: storeUpdate.latitude,
        longitude: storeUpdate.longitude,
        status: 'ACTIVE'
    };

    const paramsPut = {
        TableName : STORE_TABLE,
        Item : changeItem
    };

    console.log(`request put item ${paramsPut}`);

    const result = await docClient.put(paramsPut).promise();

    console.log(`result put item ${result}`);

    return changeItem;
}

function validateRequest(event: APIGatewayProxyEvent) {

    if (event.httpMethod !== 'PUT') {
        throw new Error(`getMethod only accept PUT method, you tried: ${event.httpMethod}`);
    }

    if (!event.body) {
        throw new Error(`body is empty: ${event}`);
    }

    if(!event.pathParameters.storeID) {
        throw new Error(`storeID is empty: ${event}`);
    }
}

async function getStore(storeID: string, docClient: DocumentClient): Promise<any> {

    const params = {
        TableName: STORE_TABLE,
        Key: {storeID: storeID},
    };

    const data = await docClient.get(params).promise();
    const item = data.Item;

    if(!item) {
        throw new Error(`Store ${storeID} not found`);
    }
    return item;
}

function validateStore(store: Store) {

    if (!store.latitude || !store.longitude) {
        throw new Error(`Campos latitude e longitude são obrigatórios!`);
    }
}

function createResponse(response: Response | ErrorResponse): APIGatewayProxyResultV2 {
    return {
        statusCode: response.code,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(response)
    };
}

export const STORE_TABLE = 'store';

export interface ErrorResponse {
    code: number;
    message: string[];
}

export interface Response {
    code: number;
    body: any;
}

export interface Store {
    storeID: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    status: string;
}
