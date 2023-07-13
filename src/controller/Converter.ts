import Express from "express";
import { exec } from "child_process";
import Path from "path";

// Source
import * as ControllerHelper from "../controller/Helper";
import * as ControllerUpload from "../controller/Upload";

export const execute = (app: Express.Express): void => {
    app.post("/msfileconverter/pdf", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request, true)
                .then((resultList) => {
                    let fileName = "";

                    for (const value of resultList) {
                        if (value.name === "file" && value.filename) {
                            fileName = value.filename;
                        }
                    }

                    const name = Path.parse(fileName).name;

                    const input = `${ControllerHelper.PATH_FILE_INPUT}${fileName}`;
                    const output = `${ControllerHelper.PATH_FILE_OUTPUT}${name}.pdf`;

                    exec(
                        `soffice --headless --convert-to pdf "${input}" --outdir "${ControllerHelper.PATH_FILE_OUTPUT}"`,
                        (error, stdout, stderr) => {
                            void (async () => {
                                if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                                    await ControllerHelper.fileReadStream(output)
                                        .then((buffer) => {
                                            ControllerHelper.responseBody(buffer.toString("base64"), "", response, 200);
                                        })
                                        .catch((error: Error) => {
                                            ControllerHelper.writeLog(
                                                "Converter.ts - ControllerHelper.fileReadStream(output) - catch error",
                                                ControllerHelper.objectOutput(error)
                                            );

                                            ControllerHelper.responseBody(stdout, error, response, 500);
                                        });

                                    await ControllerHelper.fileRemove(input)
                                        .then()
                                        .catch((error: Error) => {
                                            ControllerHelper.writeLog(
                                                "Converter.ts - ControllerHelper.fileRemove(input) - catch error: ",
                                                ControllerHelper.objectOutput(error)
                                            );
                                        });

                                    await ControllerHelper.fileRemove(output)
                                        .then()
                                        .catch((error: Error) => {
                                            ControllerHelper.writeLog(
                                                "Converter.ts - ControllerHelper.fileRemove(output) - catch error: ",
                                                ControllerHelper.objectOutput(error)
                                            );
                                        });
                                } else if (stdout === "" && stderr !== "") {
                                    ControllerHelper.writeLog("Converter.ts - exec('soffice... - stderr", stderr);

                                    await ControllerHelper.fileRemove(input)
                                        .then()
                                        .catch((error: Error) => {
                                            ControllerHelper.writeLog(
                                                "Converter.ts - ControllerHelper.fileRemove(input) - catch error: ",
                                                ControllerHelper.objectOutput(error)
                                            );
                                        });

                                    ControllerHelper.responseBody("", stderr, response, 500);
                                }
                            })();
                        }
                    );
                })
                .catch((error: Error) => {
                    ControllerHelper.writeLog("Converter.ts - ControllerUpload.execute() - catch error: ", ControllerHelper.objectOutput(error));

                    ControllerHelper.responseBody("", error, response, 500);
                });
        })();
    });
};
