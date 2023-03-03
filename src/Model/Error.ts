export interface CmdError {
    name: string;
    message: string;
    stack?: string;
    cmd?: string | undefined;
    killed?: boolean | undefined;
    code?: number | undefined;
    signal?: NodeJS.Signals | undefined;
}
