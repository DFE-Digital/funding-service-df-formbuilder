import { ServiceBusClient, ServiceBusMessage } from "@azure/service-bus";
import { ComponentTypeEnum } from "@xgovformbuilder/model";
import moment from "moment";
import config from "server/config";
import { trackEvent } from "src/server/logging/customTracker";
const { isDebugging } = config;
import { debugConsoleLog } from "src/server/utils/commonUtils";

// connection string to your Service Bus namespace
const sbconnectionString = config.servicebusConnectionString;

// name of the queue
const queueName = config.pdfPrintQueueName;

export const sendSbMsg = async (
    message: any,
    subject: string,
    Properties: ServiceBusMessage["applicationProperties"]
): Promise<any | null> => {
    const sbClient = new ServiceBusClient(sbconnectionString);
    const sender = sbClient.createSender(queueName);

    try {
        var msgtime = new Date();
        msgtime.setMinutes(1);
       message.details.forEach(element => {
        element.items = element.items.filter(s=>s.type !== ComponentTypeEnum.Filedownload) 
        
        element.items.forEach((item: any) => {
        const prefix = item.options?.prefixValue;
        const suffix = item.options?.suffixValue;

        if ((prefix || suffix) && item.value) {

            if(prefix)
            {                
                item.value = item.value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
            }

            const formattedValue = [
                prefix,
                item.value,
                suffix
            ]
                .filter(Boolean) // removes undefined/null/empty
                .join(" ");

            item.value = formattedValue;
        }
        });
       });
       
        const sbmsg: ServiceBusMessage = {
            contentType: "application/json",
            subject: subject,
            body: { message },
            applicationProperties: Properties,
            scheduledEnqueueTimeUtc: moment
                .utc(moment().add(1, "minutes"))
                .toDate(),
        };
        isDebugging &&
            trackEvent(`Application Insights: sendSbMsg is called`, {
                message,
                sender,
            });
        await sender.sendMessages(sbmsg);
        debugConsoleLog(`Sent message to the queue: ${queueName}`);

        // Close the sender
        await sender.close();
    } catch (e: any) {
        debugConsoleLog("Error occurred: ", e);
        trackEvent(
            `Application Insights: sendSbMsg failed`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        process.exit(1);
    } finally {
        await sbClient.close();
    }
};

export const receiveSbMsg = async (): Promise<any | null> => {
    const sbClient = new ServiceBusClient(sbconnectionString);
    const receiver = sbClient.createReceiver(queueName);

    try {
        const myMessageHandler = async (messageReceived) => {
            debugConsoleLog(`Received message: ${messageReceived.body}`);
            trackEvent(`Application Insights: Received message`, {
                messageReceived,
            });
        };
        trackEvent(`Application Insights: Received message called`, {
            receiver,
        });

        const myErrorHandler = async (error) => {
            debugConsoleLog(error);
        };

        receiver.subscribe({
            processMessage: myMessageHandler,
            processError: myErrorHandler,
        });

        await delay(20000);

        await receiver.close();
    } catch (e: any) {
        trackEvent(
            `Application Insights: receiveSbMsg failed`,
            {
                error: JSON.stringify(e.message),
            },
            true
        );
        debugConsoleLog("Error occurred: ", e);
        process.exit(1);
    } finally {
        await sbClient.close();
    }
};
