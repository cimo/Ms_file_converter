import Express, { Request, Response } from "express";
import Path from "path";
import { execFile } from "child_process";
import { Ca } from "@cimo/authentication";

// Source
import * as HelperSrc from "../HelperSrc";
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

                    const input = `${HelperSrc.PATH_ROOT}${HelperSrc.PATH_FILE_INPUT}${filename}`;
                    const output = `${HelperSrc.PATH_ROOT}${HelperSrc.PATH_FILE_OUTPUT}${Path.parse(filename).name}.${mode}`;

                    const execCommand = `. ${HelperSrc.PATH_ROOT}${HelperSrc.PATH_FILE_SCRIPT}command1.sh`;
                    const execArgumentList = [`"${mode}"`, `"${input}"`, `"${HelperSrc.PATH_ROOT}${HelperSrc.PATH_FILE_OUTPUT}"`];

                    execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                        if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                            HelperSrc.fileReadStream(output, (resultFileReadStream) => {
                                if (Buffer.isBuffer(resultFileReadStream)) {
                                    HelperSrc.responseBody(resultFileReadStream.toString("base64"), "", response, 200);
                                } else {
                                    HelperSrc.writeLog(
                                        `Converter.ts - api() => post(/api/${mode}) => execute() => execFile(soffice) => fileReadStream()`,
                                        resultFileReadStream.toString()
                                    );

                                    HelperSrc.responseBody("", resultFileReadStream.toString(), response, 500);
                                }

                                HelperSrc.fileRemove(input, (resultFileRemove) => {
                                    if (typeof resultFileRemove !== "boolean") {
                                        HelperSrc.writeLog(
                                            `Converter.ts - api() => post(/api/${mode}) => execute() => execFile(soffice) => fileReadStream() => fileRemove(input)`,
                                            resultFileRemove.toString()
                                        );

                                        HelperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                                    }
                                });

                                HelperSrc.fileRemove(output, (resultFileRemove) => {
                                    if (typeof resultFileRemove !== "boolean") {
                                        HelperSrc.writeLog(
                                            `Converter.ts - api() => post(/api/${mode}) => execute() => execFile(soffice) => fileReadStream() => fileRemove(output)`,
                                            resultFileRemove.toString()
                                        );

                                        HelperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                                    }
                                });
                            });
                        } else if (stdout === "" && stderr !== "") {
                            HelperSrc.writeLog(`Converter.ts - api() => post(/api/${mode}) => execute() => execFile(soffice) => stderr`, stderr);

                            HelperSrc.fileRemove(input, (resultFileRemove) => {
                                if (typeof resultFileRemove !== "boolean") {
                                    stderr += resultFileRemove;

                                    HelperSrc.writeLog(
                                        `Converter.ts - api() => post(/api/${mode}) => execute() => execFile(soffice) => fileRemove(input)`,
                                        resultFileRemove.toString()
                                    );
                                }
                            });

                            HelperSrc.responseBody("", stderr, response, 500);
                        }
                    });
                })
                .catch((error: Error) => {
                    HelperSrc.writeLog(`Converter.ts - api() => post(/api/${mode}) => execute() => catch()`, error);

                    HelperSrc.responseBody("", error, response, 500);
                });
        })();
    };
}
