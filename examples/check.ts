import Ding from "../src";

const customerUuid = process.env.DING_CUSTOMER_UUID || '';
const token = process.env.DING_API_TOKEN || '';
const authUuid = process.env.AUTH_UUID || '';
const code = process.env.CODE || '';

const client = new Ding(customerUuid, token);

client.check(authUuid, code).then(console.debug);
