import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {

    const docClient = new DocumentClient();

    console.info(`request from: ${event.path} params: ${event.pathParameters}`);

    try {

        validateRequest(event);

        const storeID = event.pathParameters.storeID;

        const store = await getStore(storeID, docClient)

        console.log(`store found ${JSON.stringify(store)}`);

        return createResponse({
            code: 200,
            body: store
        });

    } catch (error) {
        return createResponseError(error.message);
    }
}

function validateRequest(event: APIGatewayProxyEvent) {

    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }

    if(!event.pathParameters.storeID) {
        throw new Error(`storeID is empty: ${event}`);
    }
}

export const STORE_TABLE = 'store';

async function getStore(storeID: string, docClient: DocumentClient): Promise<Store> {

    const params = {
        TableName: STORE_TABLE,
        Key: {storeID: storeID},
    };

    const data = await docClient.get(params).promise();
    const item = data.Item;

    if(!item) {
        throw new Error(`Store ${storeID} not found`);
    }

    return item as unknown as Store;
}

function createResponse(response: Response): APIGatewayProxyResultV2 {
    return {
        statusCode: response.code,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(response.body)
    };
}

function createResponseError(message: string): APIGatewayProxyResultV2 {
    return createResponse({
        code: 400,
        body: {
            code: 400,
            message: [message]
        }
    });
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
