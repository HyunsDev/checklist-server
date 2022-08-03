import { APIGatewayEvent, Context } from "aws-lambda";

export const hello:Function = async (event: APIGatewayEvent, Context: Context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        ENV_MESSAGE: process.env.ENV_MESSAGE,
        Context: Context,
        input: event,
      },
      null,
      2
    ),
  };
};
