const amqp = require('amqplib/callback_api');

const { addTransaction, sendToValidator } = require('./batcher');

const { logger } = require('./log')


amqp.connect('amqp://ehr-queue', (err, connection) => {
    try {

        if (err) {
            throw {err};
        }

        connection.createConfirmChannel((e, c) => {
            try {
                if (e) {
                    throw e
                }

                const q = "ehrQ";

                c.assertQueue(q, {
                    durable: true
                });
                logger.info(`Waiting for message from ${q}`);

                c.consume(q, async (msg) => {
                    logger.info(`Sending ${JSON.parse(msg.content.toString()).address} to validator.`);
                    addTransaction(JSON.parse(msg.content.toString()));


                    try {
                        const send = await sendToValidator();
                        logger.info(`Transaction done!!! for : ${JSON.parse(msg.content.toString()).address}`);
                        c.ack(msg);
                    }
                    catch (err) {
                        logger.error(`couldn't send to ${JSON.parse(msg.content.toString()).address} validator, will retry!!!`);
                        c.nack(msg);
                    }

                }, {
                        noAck: false
                    });
            }
            catch (err) {
                logger.error(`${JSON.stringify(err)}`);
            }
        });


    }
    catch (err) {
        logger.error(`${JSON.stringify(err)}`)
    }
});
