import { object, string, union, literal, Infer, assert, StructError } from "superstruct";

export enum Type {
    InvalidPhoneNumber,
    InvalidLine,
    UnsupportedRegion,
    NegativeBalance,
    AccountInvalid,
    InvalidAuthUuid,
    InvalidToken,
    ApiError,
}

interface AuthenticationErrorProps {
    type: Type;
    message: string;
}


export class DingError extends Error {
    public readonly type: Type;

    constructor(props: AuthenticationErrorProps) {
        super(props.message);
        this.type = props.type;
    }
}

export class UnauthorizedError extends DingError {
    constructor() {
        super({ type: Type.InvalidToken, message: 'invalid API token or account UUID' });
    }
}

export const ErrObject = object({
    message: string(),
    code: union([
        literal("invalid_phone_number"),
        literal("invalid_line"),
        literal("unsupported_region"),
        literal("negative_balance"),
        literal("account_invalid"),
        literal("invalid_auth_uuid"),
        literal("internal_server_error"),
        literal("bad_request")
    ]),
    doc_url: string(),
})

export function handleApiError(body: Infer<typeof ErrObject>) {
    try {
        assert(body, ErrObject);
    } catch (err: unknown) {
        if (err instanceof StructError) {
            throw new DingError({ type: Type.ApiError, message: err.message });
        }
        throw err;
    }

    throw new DingError({ type: errCodeToType(body.code), message: body.message });
}


export function errCodeToType(errorCode: string): Type {
    switch (errorCode) {
        case 'invalid_phone_number':
            return Type.InvalidPhoneNumber;
        case 'invalid_line':
            return Type.InvalidLine;
        case 'unsupported_region':
            return Type.UnsupportedRegion;
        case 'negative_balance':
            return Type.NegativeBalance;
        case 'account_invalid':
            return Type.AccountInvalid;
        case 'invalid_auth_uuid':
            return Type.InvalidAuthUuid;
        default:
            return Type.ApiError;
    }
}