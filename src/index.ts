import {
    Authentication,
    authenticate,
    Status as AuthStatus,
    Options as AuthOptions,
    DeviceType,
} from "./authentication";
import { Retry, retry, Status as RetryStatus } from "./retry";
import { Check, check, Status as CheckStatus } from "./check";

class Client {
    constructor(customerUuid: string, apiToken: string) {
        this.customerUuid = customerUuid;
        this.apiToken = apiToken;
    }

    private readonly customerUuid: string;
    private readonly apiToken: string;

    async authenticate(phoneNumber: string, options?: AuthOptions): Promise<Authentication> {
        return authenticate(this.apiToken, this.customerUuid, phoneNumber, options);
    }

    async retry(authUuid: string): Promise<Retry> {
        return retry(this.apiToken, this.customerUuid, authUuid);
    }

    async check(authUuid: string, code: string): Promise<Check> {
        return check(this.apiToken, this.customerUuid, authUuid, code);
    }
}

export { Authentication, Retry, Check, RetryStatus, CheckStatus, AuthStatus, DeviceType, Client as default };
