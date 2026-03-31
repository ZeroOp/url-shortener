
import { UrlCreatedListner } from './events/listners/url-created-listner';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  console.log("Start up ...");
  if(!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }

  if(!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }

  if(!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )

    // better to have it inside the central located file. 
    natsWrapper.client.on('close', () => {
        console.log("NATS connection closed!");
        process.exit();
    });

    new UrlCreatedListner(natsWrapper.client).listen();

    process.on('SIGINT', ()=> natsWrapper.client.close());
    process.on('SIGTERM', ()=> natsWrapper.client.close());

  }
  catch (err) {
    console.log(err);
  }
}

start();