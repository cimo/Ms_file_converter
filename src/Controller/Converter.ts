import Express from "express";
import Path from "path";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";

export const execute = (app: Express.Express): void => {
    app.post("/msfileconverter/pdf", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    const input = result.input;
                    const output = result.output;

                    exec(`soffice --headless --convert-to pdf "${input}" --outdir "${Path.dirname(output)}"`, (error, stdout, stderr) => {
                        void (async () => {
                            ControllerHelper.writeLog("Converter.ts - exec('soffice... - stdout", stdout);
                            ControllerHelper.writeLog("Converter.ts - exec('soffice... - stderr", stderr);

                            if (stdout !== "" && stderr === "") {
                                await ControllerHelper.fileReadStream(result.output)
                                    .then((buffer) => {
                                        response.status(200).send(buffer.toString("base64"));

                                        ControllerHelper.fileRemove(input);
                                        ControllerHelper.fileRemove(output);
                                    })
                                    .catch((error: Error) => {
                                        ControllerHelper.writeLog("Converter.ts - ControllerHelper.fileReadStream - catch error", ControllerHelper.objectOutput(error));

                                        ControllerHelper.fileRemove(input);
                                        ControllerHelper.fileRemove(output);

                                        response.status(500).send({ Error: "Conversion failed." });
                                    });
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.fileRemove(input);
                                ControllerHelper.fileRemove(output);

                                response.status(500).send({ Error: "Conversion failed." });
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
