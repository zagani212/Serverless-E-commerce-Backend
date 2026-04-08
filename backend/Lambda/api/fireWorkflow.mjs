import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const sfn = new SFNClient({ region: "eu-west-3" });

export const handler = async (event) => {
    const input = {
        body: JSON.parse(event.body),
        headers: event.headers
    };

    await sfn.send(new StartExecutionCommand({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        input: JSON.stringify(input)
    }));

    return { statusCode: 200, body: JSON.stringify({ message: "Step Function started" }) };
};