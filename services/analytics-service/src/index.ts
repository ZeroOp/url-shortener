import { clickhouseWrapper } from './clickhouse-wrapper';

const start = async () => {
  try {

    await clickhouseWrapper.connect(
      process.env.CLICKHOUSE_URI || 'http://clickhouse-srv:8123'
    );

  } catch (err) {
    console.error(err);
  }
};

start();