import {
    Authentication,
    authenticate,
    Status as AuthStatus,
    Options as AuthOptions,
    DeviceType,
} from "./authentication";
import { Retry, retry, Status as RetryStatus } from "./retry";
import { Check, check, Status as CheckStatus } from "./check";

/**
 * The Ding client.
 * 
 * @see https://docs.ding.live/api
 */
class Client {
    /**
     * Creates a new Ding client.
     * 
     * @param customerUuid Your customer UUID
     * @param apiToken Your API token
     * @param config Additional configuration
     * @see https://docs.ding.live/api/authentication
     */
    constructor(customerUuid: string, apiToken: string) {
        this.customerUuid = customerUuid;
        this.apiToken = apiToken;
    }

    private readonly customerUuid: string;
    private readonly apiToken: string;

    /**
     * Performs an authentication request against the Ding API.
     * Authentication requests allow you to send a message to a given phone number with a code that the user will have to enter in your app.
     * 
     * @param phoneNumber Your user's phone number
     * @param options Additional options for the authentication request
     * @returns A promise that resolves to an Authentication object
     */
    async authenticate(phoneNumber: string, options?: AuthOptions): Promise<Authentication> {
        return authenticate(this.apiToken, this.customerUuid, phoneNumber, options);
    }

    /**
     * Retry performs a retry request against the Ding API. 
     * Retry requests allow you to send a new SMS to the user with a new code, using the initial authentication UUID.
     * 
     * @param authUuid The authentication UUID you received from the authenticate request
     * @returns A promise that resolves to a Retry object
     * @see authenticate to get an authentication UUID
     */
    async retry(authUuid: string): Promise<Retry> {
        return retry(this.apiToken, this.customerUuid, authUuid);
    }

    /**
     * Check performs a check request against the Ding API. 
     * Check requests allow you to enter the code that the user entered in your app to check if it is valid.
     * 
     * @param authUuid The authentication UUID you received from the authenticate request
     * @param code The code that the user entered in your app
     * @returns A promise that resolves to a Check object
     * @see authenticate to get an authentication UUID
     */
    async check(authUuid: string, code: string): Promise<Check> {
        return check(this.apiToken, this.customerUuid, authUuid, code);
    }
}

export { Authentication, Retry, Check, RetryStatus, CheckStatus, AuthStatus, DeviceType, Client as default };
