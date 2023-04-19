import { parseJSON } from 'date-fns'
import { type Infer, StructError, assert, literal, object, string, union } from 'superstruct'
import { baseUrl } from './config.js'
import { DingError, UnauthorizedError, Type, handleApiError } from './error.js'

export async function authenticate(apiToken: string, customerUuid: string, phoneNumber: string): Promise<Authentication> {
    const response = await fetch(`${baseUrl}/authentication`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': apiToken
        },
        body: JSON.stringify({ phone_number: phoneNumber, customer_uuid: customerUuid })
    })

    if (response.status === 403) {
        throw new UnauthorizedError()
    }

    if (!response.ok) {
        handleApiError(await response.json())
    }

    const body: Infer<typeof OkObject> = await response.json()

    try {
        assert(body, OkObject)
    } catch (err: unknown) {
        if (err instanceof StructError) {
            throw new DingError({ type: Type.ApiError, message: err.message })
        }
        throw err
    }

    return {
        uuid: body.authentication_uuid,
        status: apiStatusToStatus(body.status),
        createdAt: parseJSON(body.created_at),
        expiresAt: parseJSON(body.expires_at)
    }
}

export enum Status {
    Unknown = 'unknown',
    Pending = 'pending',
    RateLimited = 'rate_limited',
    SpamDetected = 'spam_detected',
    Approved = 'approved',
    Canceled = 'canceled',
    Expired = 'expired',
}

export interface Authentication {
    uuid: string
    status: Status
    createdAt: Date
    expiresAt: Date
}

// ----------------------------------------------------------------------------

const OkObject = object({
    authentication_uuid: string(),
    status: union([
        literal('pending'),
        literal('rate_limited'),
        literal('spam_detected'),
        literal('approved'),
        literal('canceled'),
        literal('expired')
    ]),
    created_at: string(),
    expires_at: string()
})

function apiStatusToStatus(status: string): Status {
    switch (status) {
        case 'pending':
            return Status.Pending
        case 'rate_limited':
            return Status.RateLimited
        case 'spam_detected':
            return Status.SpamDetected
        case 'approved':
            return Status.Approved
        case 'canceled':
            return Status.Canceled
        case 'expired':
            return Status.Expired
        default:
            return Status.Unknown
    }
}