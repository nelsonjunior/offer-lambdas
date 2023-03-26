import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import * as AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';

AWSXRay.captureAWS(AWS);

const docClient = new AWS.DynamoDB.DocumentClient();
const segment = AWSXRay.getSegment();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {

    console.info(`request from: ${event.path} params: ${event.pathParameters}`);

    try {

        validateRequest(event);

        const storeID = event.pathParameters.storeID;

        const store = await getStore(storeID)
        segment.addMetadata('dynamodb', store);

        console.log(`store found ${JSON.stringify(store)}`);

        return createResponse({
            code: 200,
            body: store
        });

    } catch (error) {
        segment.addError(error);
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

async function getStore(storeID: string): Promise<Store> {

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
