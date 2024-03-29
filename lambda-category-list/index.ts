import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {

    const docClient = new DocumentClient();

    console.info(`Request from: ${event.path} params: ${event.pathParameters}`);

    try {

        validateRequest(event);

        const categories = await getCategories(docClient)

        console.log(`categories response ${JSON.stringify(categories)}`);

        return createResponse({
            code: 200,
            body: categories
        });

    } catch (error) {
        return createResponseError(error.message);
    }
}

function validateRequest(event: APIGatewayProxyEvent) {

    if (event.httpMethod !== 'GET') {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
}

async function getCategories(docClient: DocumentClient): Promise<Category[]> {

    const params = {
        TableName: CATEGORY_TABLE
    };

    const data = await docClient.scan(params).promise();
    const item = data.Items;
    return item as unknown as Category[];
}

export const CATEGORY_TABLE = 'category';

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

export interface Category {
    categoryID: string;
    name: string;
}
