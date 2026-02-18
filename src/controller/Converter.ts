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
            .execute(request, true)
            .then((resultControllerUploadList) => {
                let fileName = "";

                for (const resultControllerUpload of resultControllerUploadList) {
                    if (resultControllerUpload.name === "file" && resultControllerUpload.fileName) {
                        fileName = resultControllerUpload.fileName;

                        break;
                    }
                }

                const uniqueId = helperSrc.generateUniqueId();

                const input = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileName}`;
                const output = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/${uniqueId}/`;

                const execCommand = `. ${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
                const execArgumentList = [`"${mode}"`, `"${input}"`, `"${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}output/"`, `"${uniqueId}"`];

                execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                    helperSrc.fileOrFolderRemove(input, (resultFileRemove) => {
                        if (typeof resultFileRemove !== "boolean") {
                            helperSrc.writeLog(
                                "Converter.ts - api() - post(/api/${mode}) - execute() - execFile() - fileOrFolderRemove(input)",
                                resultFileRemove.toString()
                            );

                            helperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                        }
                    });

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
                });
            })
            .catch((error: Error) => {
                helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - catch()`, error);

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
