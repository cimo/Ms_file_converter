import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import Path from "path";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";
import ControllerUpload from "./Upload.js";

export default class Service {
    // Variable
    private app: Express.Express;
    private limiter: RateLimitRequestHandler;
    private controllerUpload: ControllerUpload;

    // Method
    private execute = (mode: string, request: Request, response: Response) => {
        const uniqueId = helperSrc.generateUniqueId();

        this.controllerUpload
            .execute(request, true, false, `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${uniqueId}/`)
            .then(async (resultControllerUploadList) => {
                let fileName = "";
                let fileBuffer: Uint8Array = Buffer.alloc(0);

                for (let a = 0; a < resultControllerUploadList.length; a++) {
                    const resultControllerUpload = resultControllerUploadList[a];

                    if (resultControllerUpload.name === "file" && resultControllerUpload.fileName) {
                        fileName = resultControllerUpload.fileName;
                        fileBuffer = resultControllerUpload.buffer;

                        break;
                    }
                }

                const fileDetail = await helperSrc.fileDetail(fileName);

                const pathInputBasename = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${uniqueId}/`;
                const pathInput = `${pathInputBasename}${fileDetail.baseName}/${fileDetail.name}`;
                const pathOutput = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}/`;

                const isOfficeOpenXml = await helperSrc.fileCheckOfficeOpenXml(fileDetail.extension, fileBuffer);

                if (!isOfficeOpenXml) {
                    const fileOrFolderDeleteInput = await helperSrc.fileOrFolderDelete(pathInputBasename);

                    if (typeof fileOrFolderDeleteInput !== "boolean") {
                        helperSrc.writeLog(
                            `Service.ts - api() - post(/api/${mode}) - execute() - fileOrFolderDelete()`,
                            fileOrFolderDeleteInput.toString()
                        );
                    }

                    helperSrc.responseBody({ state: "ko", message: "File content does not match the extension." }, response, 500);

                    return;
                }

                if (fileDetail.extension === "xlsx") {
                    await helperSrc.xlsxViewReset(pathInput);
                }

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
                        helperSrc.writeLog(`Service.ts - api() - post(/api/${mode}) - execute() - executionFile() - error`, result.error.message);

                        helperSrc.responseBody({ state: "ko", message: "Conversion failed." }, response, 500);
                    } else if (result.stdout === "" && result.stderr !== "") {
                        helperSrc.writeLog(`Service.ts - api() - post(/api/${mode}) - execute() - executionFile() - stderr`, result.stderr);

                        helperSrc.responseBody({ state: "ko", message: "Conversion failed." }, response, 500);
                    } else if ((result.stdout !== "" && result.stderr === "") || (result.stdout !== "" && result.stderr !== "")) {
                        if (mode === "pdf") {
                            const fileReadStream = await helperSrc.fileReadStream(`${pathOutput}${Path.parse(fileName).name}.${mode}`);

                            if (!Buffer.isBuffer(fileReadStream)) {
                                helperSrc.writeLog(
                                    `Service.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileReadStream()`,
                                    fileReadStream.toString()
                                );

                                helperSrc.responseBody({ state: "ko", message: "Conversion failed." }, response, 500);
                            } else {
                                helperSrc.responseBody({ state: "ok", message: "", data: fileReadStream.toString("base64") }, response, 200);
                            }
                        } else if (mode === "jpg") {
                            const pathPageList = await helperSrc.findPathFileRecursive(pathOutput, "jpg");

                            pathPageList.sort((left, right) => parseInt(Path.parse(left).name, 10) - parseInt(Path.parse(right).name, 10));

                            const base64List: string[] = [];

                            for (let a = 0; a < pathPageList.length; a++) {
                                const fileReadStream = await helperSrc.fileReadStream(pathPageList[a]);

                                if (Buffer.isBuffer(fileReadStream)) {
                                    base64List.push(fileReadStream.toString("base64"));
                                }
                            }

                            if (base64List.length === 0 || base64List.length !== pathPageList.length) {
                                helperSrc.writeLog(
                                    `Service.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileReadStream()`,
                                    `${base64List.length}/${pathPageList.length}`
                                );

                                helperSrc.responseBody({ state: "ko", message: `${base64List.length}/${pathPageList.length}` }, response, 500);
                            } else {
                                helperSrc.responseBody({ state: "ok", message: "", data: JSON.stringify(base64List) }, response, 200);
                            }
                        }
                    }

                    const fileOrFolderDeleteInput = await helperSrc.fileOrFolderDelete(pathInputBasename);

                    if (typeof fileOrFolderDeleteInput !== "boolean") {
                        helperSrc.writeLog(
                            `Service.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileOrFolderDelete()`,
                            fileOrFolderDeleteInput.toString()
                        );
                    }

                    const fileOrFolderDeleteOutput = await helperSrc.fileOrFolderDelete(pathOutput);

                    if (typeof fileOrFolderDeleteOutput !== "boolean") {
                        helperSrc.writeLog(
                            `Service.ts - api() - post(/api/${mode}) - execute() - executionFile() - fileOrFolderDelete()`,
                            fileOrFolderDeleteOutput.toString()
                        );
                    }
                });
            })
            .catch((error: Error) => {
                helperSrc.writeLog(`Service.ts - api() - post(/api/${mode}) - execute() - catch()`, error.message);

                helperSrc.responseBody({ state: "ko", message: error.message }, response, 500);
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
