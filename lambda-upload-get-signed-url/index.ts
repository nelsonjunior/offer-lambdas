import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import {uuidv4} from "uuid";
import {APIGatewayProxyStructuredResultV2} from "aws-lambda/trigger/api-gateway-proxy";
import {S3} from "aws-sdk";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {

    console.info(`request from: ${event.path} params: ${event.pathParameters}`);

    const result = await getSignedUploadURL();

    console.log('Result: ', result);

    return result;
}

async function getSignedUploadURL(): Promise<APIGatewayProxyStructuredResultV2> {

    const s3 = new S3({region: 'us-east-1'});
    const actionId = uuidv4();
    const expires = 30 * 60; // 30 minutes in seconds
    const fileExtension = '.jpg';

    const s3Params = {
        Bucket: process.env.UPLOAD_BUCKET,
        Key:  `${actionId}${fileExtension}`,
        ContentType: 'image/jpeg',
        Expires: expires
    };

    console.log('getUploadURL: ', s3Params);

    const signedURL = s3.getSignedUrlPromise('putObject', s3Params);

    return signedURL.then((url: string) => {
        return new Promise((resolve, reject) => {
            resolve(createResponse(200,{
                url: url,
                fileName: `${actionId}${fileExtension}`
            }))
        })
    });
}

function createResponse(statusCode: number, body: any): APIGatewayProxyStructuredResultV2 {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
