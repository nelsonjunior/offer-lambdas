import {PostConfirmationConfirmSignUpTriggerEvent, APIGatewayProxyResultV2, Context, Callback} from "aws-lambda";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const handler = (
    event: PostConfirmationConfirmSignUpTriggerEvent,
    context: Context,
    callback: Callback<PostConfirmationConfirmSignUpTriggerEvent>) => {

    console.log(event, context, callback);

    const docClient = new DocumentClient();

    const params = {
        TableName : 'store',
        Item: {
            storeID : event.userName,
            name: event.request.userAttributes.name,
            email: event.request.userAttributes.email,
            latitude: -15.7801,
            longitude: -47.9292,
            status: 'INACTIVE'
        }
    };

    docClient.put(params, function(err, data){

        console.log("Result PUT Store: ", err, data);

        if (err) {
            console.error("Error PUT Store: ", err);
        }
        callback(err, event);
    });

}