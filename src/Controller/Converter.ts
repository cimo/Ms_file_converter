import Express from "express";
import Path from "path";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";

const removeFile = (input: string | undefined, output: string | undefined) => {
    if (input) {
        ControllerHelper.fileRemove(input)
            .then(() => {
                ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileRemove - input", input);
            })
            .catch((error: Error) => {
                ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileRemove - error", ControllerHelper.objectOutput(error));
            });
    }

    if (output) {
        ControllerHelper.fileRemove(output)
            .then(() => {
                ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileRemove - output", output);
            })
            .catch((error: Error) => {
                ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileRemove - error", ControllerHelper.objectOutput(error));
            });
    }
};

export const execute = (app: Express.Express): void => {
    app.post("/msfileconverter/pdf", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    const input = result.input;
                    const output = result.output;

                    exec(`soffice --headless --convert-to pdf "${input}" --outdir "${Path.dirname(output)}"`, (error, stdout, stderr) => {
                        void (async () => {
                            if (stdout !== "" && stderr === "") {
                                await ControllerHelper.fileReadStream(result.output)
                                    .then((buffer) => {
                                        ControllerHelper.writeLog("Converter.ts - exec('soffice... - stdout", stdout);

                                        response.status(200).send(buffer.toString("base64"));

                                        removeFile(input, output);
                                    })
                                    .catch((error: Error) => {
                                        ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileReadStream - catch error", ControllerHelper.objectOutput(error));

                                        removeFile(input, output);

                                        response.status(500).send({ Error: stderr });
                                    });
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.writeLog("Converter.ts - exec('soffice... - stderr", stderr);

                                removeFile(input, output);

                                response.status(500).send({ Error: stderr });
                            }
                        })();
                    });
                })
                .catch(() => {
                    response.status(500).send({ Error: "Upload failed." });
                });
        })();
    });
};
