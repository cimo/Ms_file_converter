import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import Path from "path";
import { execFile } from "child_process";
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
                const input = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileDetail.baseName}/${fileDetail.fileName}`;
                const inputFolder = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileDetail.baseName}/`;
                const output = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}/`;

                const execCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
                const execArgumentList = [execCommand, mode, input, `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/`, uniqueId];

                execFile("/bin/bash", execArgumentList, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error) {
                        helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - execFile() - error`, error.message);

                        helperSrc.responseBody("", error.message, response, 500);

                        return;
                    }

                    if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                        helperSrc.fileReadStream(`${output}${Path.parse(fileName).name}.${mode}`, (resultFileReadStream) => {
                            if (Buffer.isBuffer(resultFileReadStream)) {
                                helperSrc.responseBody(resultFileReadStream.toString("base64"), "", response, 200);
                            } else {
                                helperSrc.writeLog(
                                    `Converter.ts - api() - post(/api/${mode}) - execute() - execFile() - fileReadStream()`,
                                    resultFileReadStream.toString()
                                );

                                helperSrc.responseBody("", resultFileReadStream.toString(), response, 500);
                            }
                        });
                    } else if (stdout === "" && stderr !== "") {
                        helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - execFile() - stderr`, stderr);

                        helperSrc.responseBody("", stderr, response, 500);
                    }

                    helperSrc.fileOrFolderDelete(inputFolder, (resultFileDelete) => {
                        if (typeof resultFileDelete !== "boolean") {
                            helperSrc.writeLog(
                                `Converter.ts - api() - post(/api/${mode}) - execute() - execFile() - fileOrFolderDelete(inputFolder)`,
                                resultFileDelete.toString()
                            );
                        }
                    });

                    helperSrc.fileOrFolderDelete(output, (resultFileDelete) => {
                        if (typeof resultFileDelete !== "boolean") {
                            helperSrc.writeLog(
                                `Converter.ts - api() - post(/api/${mode}) - execute() - execFile() - fileOrFolderDelete(output)`,
                                resultFileDelete.toString()
                            );
                        }
                    });
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
