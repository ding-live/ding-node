# Ding Javascript SDK

[![Version](https://img.shields.io/npm/v/@ding-live/sdk.svg)](https://www.npmjs.org/package/@ding-live/sdk)

The Ding Javascript SDK allows Javascript backends to access the Ding API programmatically.

## Requirements

Node 12 or higher.

## Installation

Install the package with:

```sh
npm install @ding-live/sdk --save
# or
yarn add @ding-live/sdk
```

## Usage

The package needs to be configured with your account's UUID and your secret key. Ping hello@ding.live to get them.

```typescript
import ding from "@ding-live/sdk";
const client = new Ding("<CUSTOMER_UUID>", "<SECRET_TOKEN>");

// Authenticate
const auth = await client.authenticate("+12065550100");

// Check the code the user entered
const check = await client.check(auth.uuid, "1234");

// Retry the auth
const retry = await client.retry(auth.uuid);
```
