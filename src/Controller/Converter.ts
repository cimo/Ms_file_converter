import Cmd from "node-cmd";
import Express from "express";
import Multer from "multer";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ModelError from "../Model/Error";

export const responseFile = async (output: string, res: Express.Response): Promise<void> => {
    await ControllerHelper.fileReadStream(output)
        .then((buffer) => {
            ControllerHelper.writeLog("Upload.ts => /msfileconverter/pdf", `fileReadStream - then: Converted.`);

            res.send(buffer.toString("base64"));
        })
        .catch((response) => {
            ControllerHelper.writeLog("Upload.ts => /msfileconverter/pdf", `fileReadStream - catch: ${response}`);
        });
};

export const execute = (app: Express.Express, multer: Multer.Multer): void => {
    app.post("/msfileconverter/pdf", multer.single("file"), async (req: Express.Request, res: Express.Response) => {
        ControllerHelper.writeLog("Upload.ts => /msfileconverter/pdf", `req.body: ${ControllerHelper.objectOutput(req.body)} / req.file: ${ControllerHelper.objectOutput(req.file)}`);

        if (req.file && req.body.checkRequest && req.body.checkRequest.tokenWrong === "" && req.body.checkRequest.parameterNotFound === "" && req.body.checkRequest.mimeTypeWrong === "") {
            const input = `./${req.file.path}`;
            const output = `${ControllerHelper.PATH_FILE_OUTPUT}${req.body.file_name.split(".")[0]}.pdf`;

            if (req.file.mimetype !== "application/pdf") {
                Cmd.run(`soffice --headless --convert-to pdf ${input} --outdir ${ControllerHelper.PATH_FILE_OUTPUT}`, async (cmdError: ModelError.CmdError) => {
                    if (cmdError) {
                        ControllerHelper.writeLog("Upload.ts => /msfileconverter/pdf", `Cmd.run(soffice ... - cmdError: ${cmdError}`);

                        ControllerHelper.fileRemove(input);
                        ControllerHelper.fileRemove(output);

                        res.status(500).send({ Error: "Conversion fail!" });
                    } else {
                        await responseFile(output, res).then(() => {
                            ControllerHelper.fileRemove(input);
                            ControllerHelper.fileRemove(output);
                        });
                    }
                });
            } else {
                await responseFile(input, res).then(() => {
                    ControllerHelper.fileRemove(input);
                });
            }
        } else if (req.body.checkRequest && req.body.checkRequest.tokenWrong !== "") {
            res.status(500).send({ Error: `Token wrong: ${req.body.checkRequest.tokenWrong}` });
        } else if (req.body.checkRequest && req.body.checkRequest.parameterNotFound !== "") {
            res.status(500).send({ Error: `Parameter not found: ${req.body.checkRequest.parameterNotFound}` });
        } else if (req.body.checkRequest && req.body.checkRequest.mimeTypeWrong !== "") {
            res.status(500).send({ Error: `Mime type worng: ${req.body.checkRequest.mimeTypeWrong}` });
        } else {
            res.status(500).send({ Error: "File not found." });
        }
    });
};
