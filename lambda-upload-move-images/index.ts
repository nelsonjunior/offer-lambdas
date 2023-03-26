import {SNSEvent} from "aws-lambda";
import * as AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';

AWSXRay.captureAWS(AWS);

const s3 = new AWS.S3({region: 'us-east-1'});
const segment = AWSXRay.getSegment();
export const handler = async (event: SNSEvent): Promise<any> => {

    console.log('Received event:', JSON.stringify(event, null, 4));

    const message = event.Records[0].Sns.Message;

    const offer = JSON.parse(message);

    console.log('Offer:', offer);

    if (!!offer) {

        console.log('Move images:', offer.images);

        const bucketOrigin = process.env.UPLOAD_BUCKET_ORIGIN;

        const bucketDestination = process.env.UPLOAD_BUCKET;

        for(let i = 0; i < offer.images.length; i++ ) {

            const image = offer.images[i];

            console.log('[image]', image);

            const s3Params = {
                Bucket: bucketOrigin,
                Key:  image
            };

            return s3.getObject(s3Params).promise()
                .then((data) => {
                    console.log('data:', data);

                    const s3Params = {
                        Bucket: bucketDestination,
                        Key:  `${offer.offerID}/${image}`,
                        Body: data.Body
                    };
                    return s3.putObject(s3Params).promise()
                        .finally(() => {
                        console.log('Completed image move:');
                        segment.addMetadata('s3', s3Params);
                    });
                }).finally(() => console.log('Image ready:', image));
        }
    }
};