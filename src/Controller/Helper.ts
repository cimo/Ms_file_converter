import Fs from "fs";
import Express from "express";

// Source
import * as ModelHelper from "../Model/Helper";

export const checkEnv = (key: string, value: string | undefined): string | undefined => {
    if (value === undefined) {
        console.log("Helper.ts => checkEnv", `error: ${key} is not defined!`);
    }

    return value;
};

export const ENV_NAME = checkEnv("ENV_NAME", process.env.ENV_NAME);
export const DOMAIN = checkEnv("DOMAIN", process.env.DOMAIN);
export const DEBUG = checkEnv("MS_FC_DEBUG", process.env.MS_FC_DEBUG);
export const CORS_ORIGIN_URL = checkEnv("MS_FC_CORS_ORIGIN_URL", process.env.MS_FC_CORS_ORIGIN_URL);
export const SERVER_PORT = checkEnv("MS_FC_SERVER_PORT", process.env.MS_FC_SERVER_PORT);
export const MIME_TYPE = checkEnv("MS_FC_MIME_TYPE", process.env.MS_FC_MIME_TYPE);
export const FILE_SIZE = checkEnv("MS_FC_FILE_SIZE", process.env.MS_FC_FILE_SIZE);
export const TOKEN = checkEnv("MS_FC_TOKEN", process.env.MS_FC_TOKEN);

export const PATH_STATIC = "./static/";
export const PATH_LOG = "./log/";
export const PATH_FILE_INPUT = "./file/input/";
export const PATH_FILE_OUTPUT = "./file/output/";
export const PATH_CERTIFICATE_FILE_KEY = "/home/root/certificate/tls.key";
export const PATH_CERTIFICATE_FILE_CRT = "/home/root/certificate/tls.crt";

export const writeLog = <T>(tag: string, value: T): void => {
    if (DEBUG === "true") {
        Fs.appendFile(`${PATH_LOG}debug.log`, `${tag}: ${value}\n`, () => {
            console.log(`WriteLog => ${tag}: `, value);
        });
    }
};

const circularReplacer = (): ModelHelper.circularReplacer => {
    const seen = new WeakSet();

    return (key: string, value: string): string | null => {
        if (value !== null && typeof value === "object") {
            if (seen.has(value)) {
                return null;
            }

            seen.add(value);
        }

        return value;
    };
};

export const objectOutput = (obj: unknown): string => {
    return JSON.stringify(obj, circularReplacer(), 2);
};

export const serverTime = (): string => {
    const currentDate = new Date();

    const month = currentDate.getMonth() + 1;
    const monthOut = month < 10 ? `0${month}` : `${month}`;

    const day = currentDate.getDate();
    const dayOut = day < 10 ? `0${day}` : `${day}`;

    const date = `${currentDate.getFullYear()}/${monthOut}/${dayOut}`;

    const minute = currentDate.getMinutes();
    const minuteOut = minute < 10 ? `0${minute}` : `${minute}`;

    const second = currentDate.getSeconds();
    const secondOut = second < 10 ? `0${second}` : `${second}`;

    const time = `${currentDate.getHours()}:${minuteOut}:${secondOut}`;

    return `${date} ${time}`;
};

export const fileReadStream = async (filePath: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunkList: Buffer[] = [];

        const readStream = Fs.createReadStream(filePath);

        readStream.on("data", (chunk: Buffer) => {
            chunkList.push(chunk);
        });

        readStream.on("end", () => {
            const buffer = Buffer.concat(chunkList);

            resolve(buffer);
        });

        readStream.on("error", reject);
    });
};

export const fileRemove = (path: string): void => {
    Fs.unlink(path, (error: NodeJS.ErrnoException | null) => {
        if (error) {
            writeLog("Helper.ts => fileRemove", `unlink - error: ${error}`);
        }
    });
};

export const checkRequest = async (req: Express.Request, file?: globalThis.Express.Multer.File): Promise<boolean> => {
    let result = false;

    // Token
    let tokenWrong = "";

    const token = req.body.token_api && TOKEN && req.body.token_api === TOKEN ? true : false;

    if (!token) {
        tokenWrong = "token_api";
    }

    // Parameter
    let parameterNotFound = "";

    if (file) {
        if (!req.body.file_name) {
            parameterNotFound = "file_name";
        } else if (!file) {
            parameterNotFound = "file";
        }
    }

    // Mime type
    let mimeTypeWrong = "";

    if (file) {
        const mimeTypeInclude = MIME_TYPE ? MIME_TYPE.includes(file.mimetype) : false;

        if (!mimeTypeInclude) {
            mimeTypeWrong = file.mimetype;
        }
    }

    // Populate request body
    req.body.checkRequest = {};
    req.body.checkRequest["tokenWrong"] = tokenWrong;
    req.body.checkRequest["parameterNotFound"] = parameterNotFound;
    req.body.checkRequest["mimeTypeWrong"] = mimeTypeWrong;

    // Result
    if (tokenWrong === "" && parameterNotFound === "" && mimeTypeWrong === "") {
        result = true;
    }

    writeLog("Helper.ts => checkRequest", `result: ${result}`);

    return result;
};
