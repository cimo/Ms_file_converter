export interface circularReplacer {
    (key: string, value: string): string | null;
}

export interface requestBody {
    token_api: string;
    file_name: string;
    file: string;
    checkRequest: checkRequest;
}

export interface checkRequest {
    tokenWrong: string;
    parameterNotFound: string;
    mimeTypeWrong: string;
}
