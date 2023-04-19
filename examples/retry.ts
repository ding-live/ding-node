import Ding from "../src";

const customerUuid = process.env.DING_CUSTOMER_UUID || '';
const token = process.env.DING_API_TOKEN || '';
const authUuid = process.env.AUTH_UUID || '';

const client = new Ding(customerUuid, token);

client.retry(authUuid).then(console.debug);
