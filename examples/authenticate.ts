import Ding from "../src";

const customerUuid = process.env.DING_CUSTOMER_UUID || '';
const token = process.env.DING_API_TOKEN || '';
const phoneNumber = process.env.PHONE_NUMBER || '';

const client = new Ding(customerUuid, token);

client.authenticate(phoneNumber).then(console.debug);
