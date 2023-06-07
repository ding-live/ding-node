import { Infer, StructError, assert, number, object, string } from 'superstruct'
import { baseUrl } from './config';
import { DingError, UnauthorizedError, Type, handleApiError } from './error';
import { parseJSON } from 'date-fns';

export async function retry(apiToken: string, customerUuid: string, authUuid: string): Promise<Retry> {
    const response = await fetch(`${baseUrl}/retry`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            "x-api-key": apiToken,
        },
        body: JSON.stringify({ authentication_uuid: authUuid, customer_uuid: customerUuid }),
    });


    if (response.status === 403) {
        throw new UnauthorizedError;
    }

    if (!response.ok) {
        handleApiError(await response.json());
    }

    const body: Infer<typeof OkObject> = await response.json();

    try {
        assert(body, OkObject);
    } catch (err: unknown) {
        if (err instanceof StructError) {
            throw new DingError({ type: Type.ApiError, message: err.message });
        }

        throw err;
    }

    return {
        authenticationUuid: body.authentication_uuid,
        status: apiStatusToStatus(body.status),
        createdAt: parseJSON(body.created_at),
        nextRetryAt: parseJSON(body.next_retry_at),
        remainingRetries: body.remaining_retry,
    }
}

export interface Retry {
    authenticationUuid: string
    status: Status
    createdAt: Date
    nextRetryAt?: Date
    remainingRetries: number
}

export enum Status {
    Unknown = "unknown",
    ApprovedRetry = "approved_retry",
    DeniedRetry = "denied_retry",
    NoAttempt = "no_attempt",
    RateLimited = "rate_limited",
    ExpiredAuth = "expired_auth",
    AlreadyValidated = "already_validated",
}
// ----------------------------------------------------------------------------

const OkObject = object({
    authentication_uuid: string(),
    created_at: string(),
    next_retry_at: string(),
    remaining_retry: number(),
    status: string(),
})

function apiStatusToStatus(status: string): Status {
    switch (status) {
        case "approved":
            return Status.ApprovedRetry
        case "denied":
            return Status.DeniedRetry
        case "no_attempt":
            return Status.NoAttempt
        case "rate_limited":
            return Status.RateLimited
        case "expired_auth":
            return Status.ExpiredAuth
        default:
            return Status.Unknown
    }
}