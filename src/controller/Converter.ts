import Express, { Request, Response } from "express";
import Path from "path";
import { execFile } from "child_process";
import { Ca } from "@cimo/authentication/dist/src/Main";

// Source
import * as helperSrc from "../HelperSrc";
import ControllerUpload from "./Upload";

export default class ControllerConverter {
    // Variable
    private app: Express.Express;
    private controllerUpload: ControllerUpload;

    // Method
    constructor(app: Express.Express) {
        this.app = app;
        this.controllerUpload = new ControllerUpload();
    }

    api = (): void => {
        this.app.post("/api/toPdf", Ca.authenticationMiddleware, (request: Request, response: Response) => {
            this.execute("pdf", request, response);
        });

        this.app.post("/api/toJpg", Ca.authenticationMiddleware, (request: Request, response: Response) => {
            this.execute("jpg", request, response);
        });
    };

    private execute = (mode: string, request: Request, response: Response) => {
        void (async () => {
            await this.controllerUpload
                .execute(request, true)
                .then((resultControllerUploadList) => {
                    let filename = "";

                    for (const resultControllerUpload of resultControllerUploadList) {
                        if (resultControllerUpload.name === "file" && resultControllerUpload.filename) {
                            filename = resultControllerUpload.filename;

                            break;
                        }
                    }

                    const input = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_INPUT}${filename}`;
                    const output = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_OUTPUT}${Path.parse(filename).name}.${mode}`;

                    const execCommand = `. ${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_SCRIPT}command1.sh`;
                    const execArgumentList = [`"${mode}"`, `"${input}"`, `"${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_OUTPUT}"`];

                    execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                        if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                            helperSrc.fileReadStream(output, (resultFileReadStream) => {
                                if (Buffer.isBuffer(resultFileReadStream)) {
                                    helperSrc.responseBody(resultFileReadStream.toString("base64"), "", response, 200);
                                } else {
                                    helperSrc.writeLog(
                                        `Converter.ts - api() - post(/api/${mode}) - execute() - execFile(soffice) - fileReadStream()`,
                                        resultFileReadStream.toString()
                                    );

                                    helperSrc.responseBody("", resultFileReadStream.toString(), response, 500);
                                }

                                helperSrc.fileRemove(input, (resultFileRemove) => {
                                    if (typeof resultFileRemove !== "boolean") {
                                        helperSrc.writeLog(
                                            `Converter.ts - api() - post(/api/${mode}) - execute() - execFile(soffice) - fileReadStream() - fileRemove(input)`,
                                            resultFileRemove.toString()
                                        );

                                        helperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                                    }
                                });

                                helperSrc.fileRemove(output, (resultFileRemove) => {
                                    if (typeof resultFileRemove !== "boolean") {
                                        helperSrc.writeLog(
                                            `Converter.ts - api() - post(/api/${mode}) - execute() - execFile(soffice) - fileReadStream() - fileRemove(output)`,
                                            resultFileRemove.toString()
                                        );

                                        helperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                                    }
                                });
                            });
                        } else if (stdout === "" && stderr !== "") {
                            helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - execFile(soffice) - stderr`, stderr);

                            helperSrc.fileRemove(input, (resultFileRemove) => {
                                if (typeof resultFileRemove !== "boolean") {
                                    stderr += resultFileRemove;

                                    helperSrc.writeLog(
                                        `Converter.ts - api() - post(/api/${mode}) - execute() - execFile(soffice) - fileRemove(input)`,
                                        resultFileRemove.toString()
                                    );
                                }
                            });

                            helperSrc.responseBody("", stderr, response, 500);
                        }
                    });
                })
                .catch((error: Error) => {
                    helperSrc.writeLog(`Converter.ts - api() - post(/api/${mode}) - execute() - catch()`, error);

                    helperSrc.responseBody("", error, response, 500);
                });
        })();
    };
}
