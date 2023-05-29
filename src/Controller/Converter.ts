import Express from "express";
import Path from "path";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";

const removeFile = (input: string, output: string, response: Express.Response) => {
    void (async () => {
        await ControllerHelper.fileRemove(input)
            .then()
            .catch((error: Error) => {
                ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileRemove() - input catch error: ", ControllerHelper.objectOutput(error));

                ControllerHelper.responseBody("", error, response, 500);
            });

        await ControllerHelper.fileRemove(output)
            .then()
            .catch((error: Error) => {
                ControllerHelper.writeLog(
                    "Converter.ts - ControllerHelper.fileRemove() - output catch error: ",
                    ControllerHelper.objectOutput(error)
                );

                ControllerHelper.responseBody("", error, response, 500);
            });
    })();
};

const pdf = (input: string, output: string, response: Express.Response) => {
    void (async () => {
        await ControllerHelper.fileReadStream(output)
            .then((buffer) => {
                removeFile(input, output, response);

                ControllerHelper.responseBody(buffer.toString("base64"), "", response, 200);
            })
            .catch((error: Error) => {
                ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileReadStream - catch error", ControllerHelper.objectOutput(error));

                removeFile(input, output, response);

                ControllerHelper.responseBody("", error, response, 500);
            });
    })();
};

export const execute = (app: Express.Express): void => {
    app.post("/msfileconverter/pdf", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    const fileName = Path.parse(result).name;
                    const output = `${ControllerHelper.PATH_FILE_OUTPUT}${fileName}.pdf`;

                    exec(
                        `soffice --headless --convert-to pdf "${result}" --outdir "${ControllerHelper.PATH_FILE_OUTPUT}"`,
                        (error, stdout, stderr) => {
                            if (stdout !== "" && stderr === "") {
                                pdf(result, output, response);
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.writeLog("Converter.ts - exec('soffice... - stderr", stderr);

                                removeFile(result, output, response);
                            } else {
                                pdf(result, output, response);
                            }
                        }
                    );
                })
                .catch((error: Error) => {
                    ControllerHelper.writeLog("Converter.ts - /msfileconverter/pdf - catch error: ", ControllerHelper.objectOutput(error));

                    ControllerHelper.responseBody("", error, response, 500);
                });
        })();
    });
};
