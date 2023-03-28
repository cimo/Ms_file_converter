import Express from "express";
import Path from "path";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";
import * as ModelHelper from "../Model/Helper";

export const responseFile = (filePath: string, response: Express.Response): Promise<void> => {
    return new Promise((resolve, reject) => {
        void (async () => {
            await ControllerHelper.fileReadStream(filePath).then((buffer) => {
                response.send(buffer.toString("base64"));

                resolve();
            }).catch((error: Error) =>{
                console.log(`Converter.ts - ControllerHelper.fileReadStream - catch error: ${ControllerHelper.objectOutput(error)}`);

                reject();
            });
        })();
    });
};

export const execute = (app: Express.Express): void => {
    app.post("/msfileconverter/pdf", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request).then((result) => {
                const input = result.input;
                const output = result.output;

                exec(`soffice --headless --convert-to pdf "${Path.dirname(input)}" --outdir "${ControllerHelper.PATH_FILE_OUTPUT}"`, (error, stdout, stderr) => {
                    void (async () => {
                        console.log(`Converter.ts - ControllerUpload.execute - stdout: ${stdout}`);
                        console.log(`Converter.ts - ControllerUpload.execute - stderr: ${stderr}`);

                        if (error) {
                            //ControllerHelper.fileRemove(input);
                            //ControllerHelper.fileRemove(output);

                            response.status(500).send({ Error: "Conversion failed." });
                        } else {
                            await responseFile(result.output, response).then(() => {
                                //ControllerHelper.fileRemove(input);
                                //ControllerHelper.fileRemove(output);

                                response.status(200).send({ Error: "Conversion succeeded." });
                            }).catch((error: Error) =>{
                                console.log(`Converter.ts - responseFile - catch error: ${ControllerHelper.objectOutput(error)}`);
                            });
                        }
                    })();
                });
            }).catch((error: Error) =>{
                console.log(`Converter.ts - ControllerUpload.execute - catch error: ${ControllerHelper.objectOutput(error)}`);

                response.status(500).send({ Error: "Upload failed." });
            });
        })();
    });

    //const test = multer.single("file");
    //app.post("/msfileconverter/pdf", test, (req: Express.Request, res: Express.Response) => {
        /*
        //ControllerHelper.writeLog("Converter.ts => app.post('/msfileconverter/pdf'", `req.body: ${ControllerHelper.objectOutput(req.body)} / req.file: ${ControllerHelper.objectOutput(req.file)}`);

        //console.log("cimo1");

        const requestBody = req.body as ModelHelper.requestBody;
        const checkRequest = requestBody.checkRequest;

        if (req.file) {
            //console.log("cimo2");

            const input = req.file.path;
            const output = `${ControllerHelper.PATH_FILE_OUTPUT}${requestBody.file_name.split(".")[0]}.pdf`;

            if (checkRequest.tokenWrong === "" && checkRequest.parameterNotFound === "" && checkRequest.mimeTypeWrong === "") {
                //console.log("cimo3");

                if (req.file.mimetype !== "application/pdf") {
                    //console.log("cimo4a");

                    exec(`soffice --headless --convert-to pdf "${input}" --outdir "${ControllerHelper.PATH_FILE_OUTPUT}"`, (error, stdout, stderr) => {
                        //console.log("cimo5");

                        //console.log(stdout);
                        //console.log(stderr);

                        if (error) {
                            //console.log("cimo6a");

                            ControllerHelper.fileRemove(input);
                            ControllerHelper.fileRemove(output);

                            res.status(500).send({ Error: "Conversion failed." });
                        } else {
                            //console.log("cimo6b");

                            responseFile(output, res, () => {
                                console.log("cimo7");

                                ControllerHelper.fileRemove(input);
                                ControllerHelper.fileRemove(output);
                            });
                        }
                    });
                } else {
                    //console.log("cimo4b");

                    responseFile(input, res, () => {
                        //console.log("cimo4c");

                        ControllerHelper.fileRemove(input);
                    });
                }
            } else if (checkRequest.tokenWrong !== "") {
                res.status(500).send({ Error: `Token wrong: ${checkRequest.tokenWrong}` });
            } else if (checkRequest.parameterNotFound !== "") {
                res.status(500).send({ Error: `Parameter not found: ${checkRequest.parameterNotFound}` });
            } else if (checkRequest.mimeTypeWrong !== "") {
                res.status(500).send({ Error: `Mime type wrong: ${checkRequest.mimeTypeWrong}` });
            }
        } else {
            res.status(500).send({ Error: "File not found." });
        }
        */
    //});
};
