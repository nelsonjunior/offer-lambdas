import {APIGatewayProxyEvent, APIGatewayProxyResultV2} from "aws-lambda";
import {S3Customizations} from "aws-sdk/lib/services/s3";
import {uuidv4} from "uuid";
import {APIGatewayProxyStructuredResultV2} from "aws-lambda/trigger/api-gateway-proxy";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {

    const s3Client = new S3Customizations({
        region: 'us-east-1'
    });

    const result = await getSignedUploadURL(s3Client);
    console.log('Result: ', result);
    return result;
}

async function getSignedUploadURL(s3Client: S3Customizations): Promise<APIGatewayProxyStructuredResultV2> {
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

    const signedURL = s3Client.getSignedUrlPromise('putObject', s3Params);

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
