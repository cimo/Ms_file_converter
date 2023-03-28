import Express from "express";
import * as FormDataParser from "form-data_parser/dist/";

// Source
import * as ControllerHelper from "../Controller/Helper";

const checkRequest = (formDataList: FormDataParser.Iinput[]): boolean => {
    const parameterList: string[] = [];
    let tokenWrong = false;
    let fileWrong = false;
    let parameterNotFound = "";

    for (const value of formDataList) {
        if (value.name === "token_api") {
            if (ControllerHelper.TOKEN && ControllerHelper.TOKEN !== value.buffer.toString()) {
                tokenWrong = true;
            }
        }

        if (value.name === "file") {
            if (value.filename === "" && value.mimeType === "") {
                fileWrong = true;
            } else if (ControllerHelper.MIME_TYPE && !ControllerHelper.MIME_TYPE.includes(value.mimeType)) {
                fileWrong = true;
            }
        }

        parameterList.push(value.name);
    }

    if (!parameterList.includes("token_api")) {
        parameterNotFound = "token_api";
    }

    if (!parameterList.includes("file_name")) {
        parameterNotFound = "file_name";
    }

    if (!parameterList.includes("file")) {
        parameterNotFound = "file";
    }

    ControllerHelper.writeLog("Helper.ts => checkRequest", `${tokenWrong.toString()} - ${fileWrong.toString()} - ${parameterNotFound}`);

    // Result
    const result = tokenWrong === false && fileWrong === false && parameterNotFound === "" ? true : false;

    return result;
};

export const execute = (request: Express.Request): Promise<Record<string, string>> => {
    return new Promise((resolve, reject) => {
        const chunkList: Buffer[] = [];

        request.on("data", (data: Buffer) => {
            chunkList.push(data);
        });

        request.on("end", () => {
            void (async () => {
                const buffer = Buffer.concat(chunkList);
                const formDataList = FormDataParser.readInput(buffer, request.headers["content-type"]);

                const check = checkRequest(formDataList);

                if (check) {
                    for (const value of formDataList) {
                        if (value.name === "file" && value.filename && value.buffer) {
                            const input = `${ControllerHelper.PATH_FILE_INPUT}${value.filename}`;
                            const output = `${ControllerHelper.PATH_FILE_OUTPUT}${value.filename.split(".")[0]}.pdf`;

                            await ControllerHelper.fileWriteStream(input, value.buffer).then(() => {
                                resolve({input, output});
                            }).catch((error: Error) =>{
                                console.log(`Upload.ts - ControllerHelper.fileWriteStream - catch error: ${ControllerHelper.objectOutput(error)}`);
                            });

                            break;
                        }
                    }
                } else {
                    reject(false);
                }
            })();
        });
    });
};
