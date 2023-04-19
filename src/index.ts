import {
    Authentication,
    authenticate,
    Status as AuthStatus,
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

    async authenticate(phoneNumber: string): Promise<Authentication> {
        return authenticate(this.apiToken, this.customerUuid, phoneNumber);
    }

    async retry(authUuid: string): Promise<Retry> {
        return retry(this.apiToken, this.customerUuid, authUuid);
    }

    async check(authUuid: string, code: string): Promise<Check> {
        return check(this.apiToken, this.customerUuid, authUuid, code);
    }
}

export { Authentication, Retry, Check, RetryStatus, CheckStatus, AuthStatus, Client as default };
