import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import Path from "path";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";
import ControllerUpload from "./Upload.js";

export default class Converter {
    // Variable
    private app: Express.Express;
    private limiter: RateLimitRequestHandler;
    private controllerUpload: ControllerUpload;

    // Method
    private execute = (mode: string, request: Request, response: Response) => {
        this.controllerUpload
            .execute(request, true, false, `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/`)
            .then((resultControllerUploadList) => {
                let fileName = "";

                for (let a = 0; a < resultControllerUploadList.length; a++) {
                    const resultControllerUpload = resultControllerUploadList[a];

                    if (resultControllerUpload.name === "file" && resultControllerUpload.fileName) {
                        fileName = resultControllerUpload.fileName;

                        break;
                    }
                }

                const fileDetail = helperSrc.fileDetail(fileName);

                const uniqueId = helperSrc.generateUniqueId();
                const pathInput = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileDetail.baseName}/${fileDetail.fileName}`;
                const pathInputBasename = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileDetail.baseName}/`;
                const pathOutput = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}/`;

                const pathExecutionCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
                const executionArgumentList = [
                    pathExecutionCommand,
                    mode,
                    pathInput,
                    `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/`,
                    uniqueId
                ];

                helperSrc.executionFile(executionArgumentList).then(async (result) => {
                    if (result.error) {
                        helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - executionFile() - error`, result.error.message);

                        helperSrc.responseBody("", "ko", response, 500);
                    } else if ((result.stdout !== "" && result.stderr === "") || (result.stdout !== "" && result.stderr !== "")) {
                        if (mode === "pdf") {
                            const fileReadStream = await helperSrc.fileReadStream(`${pathOutput}${Path.parse(fileName).name}.${mode}`);

                            if (Buffer.isBuffer(fileReadStream)) {
                                helperSrc.responseBody(fileReadStream.toString("base64"), "", response, 200);
                            } else {
                                helperSrc.writeLog(
                                    `Converter.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileReadStream()`,
                                    fileReadStream.toString()
                                );

                                helperSrc.responseBody("", "ko", response, 500);
                            }
                        } else if (mode === "jpg") {
                            const pathPageList = await helperSrc.findInDirectoryRecursive(pathOutput, ".jpg");

                            pathPageList.sort((left, right) => parseInt(Path.parse(left).name, 10) - parseInt(Path.parse(right).name, 10));

                            const base64List: string[] = [];

                            for (let a = 0; a < pathPageList.length; a++) {
                                const fileReadStream = await helperSrc.fileReadStream(pathPageList[a]);

                                if (Buffer.isBuffer(fileReadStream)) {
                                    base64List.push(fileReadStream.toString("base64"));
                                }
                            }

                            if (base64List.length > 0 && base64List.length === pathPageList.length) {
                                helperSrc.responseBody(JSON.stringify(base64List), "", response, 200);
                            } else {
                                helperSrc.writeLog(
                                    `Converter.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileReadStream()`,
                                    `${base64List.length}/${pathPageList.length}`
                                );

                                helperSrc.responseBody("", "ko", response, 500);
                            }
                        }
                    } else if (result.stdout === "" && result.stderr !== "") {
                        helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - executionFile() - stderr`, result.stderr);

                        helperSrc.responseBody("", "ko", response, 500);
                    }

                    const fileOrFolderDeleteInput = await helperSrc.fileOrFolderDelete(pathInputBasename);

                    if (typeof fileOrFolderDeleteInput !== "boolean") {
                        helperSrc.writeLog(
                            `Converter.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileOrFolderDelete()`,
                            fileOrFolderDeleteInput.toString()
                        );
                    }

                    const fileOrFolderDeleteOutput = await helperSrc.fileOrFolderDelete(pathOutput);

                    if (typeof fileOrFolderDeleteOutput !== "boolean") {
                        helperSrc.writeLog(
                            `Converter.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileOrFolderDelete()`,
                            fileOrFolderDeleteOutput.toString()
                        );
                    }
                });
            })
            .catch((error: Error) => {
                helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - catch()`, error.message);

                helperSrc.responseBody("", "ko", response, 500);
            });
    };

    constructor(app: Express.Express, limiter: RateLimitRequestHandler) {
        this.app = app;
        this.limiter = limiter;
        this.controllerUpload = new ControllerUpload();
    }

    api = (): void => {
        this.app.post("/api/toPdf", this.limiter, Ca.authenticationMiddleware, (request: Request, response: Response) => {
            this.execute("pdf", request, response);
        });

        this.app.post("/api/toJpg", this.limiter, Ca.authenticationMiddleware, (request: Request, response: Response) => {
            this.execute("jpg", request, response);
        });
    };
}
