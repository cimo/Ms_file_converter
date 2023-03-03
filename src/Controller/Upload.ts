import Express from "express";
import Multer from "multer";

// Source
import * as ControllerHelper from "../Controller/Helper";

export const execute = (): Multer.Multer => {
    const multerDiskStorage = Multer.diskStorage({
        destination: (req: Express.Request, file: globalThis.Express.Multer.File, callback) => {
            ControllerHelper.writeLog("Upload.ts => Multer.diskStorage", `destination: ${ControllerHelper.PATH_FILE_INPUT}`);

            callback(null, ControllerHelper.PATH_FILE_INPUT);
        },
        filename: (req: Express.Request, file: globalThis.Express.Multer.File, callback) => {
            ControllerHelper.writeLog("Upload.ts => Multer.diskStorage", `filename: ${ControllerHelper.objectOutput(file)}`);

            callback(null, file.originalname);
        }
    });

    return Multer({
        storage: multerDiskStorage,
        limits: {
            fileSize: parseInt(ControllerHelper.FILE_SIZE ? ControllerHelper.FILE_SIZE : "0") * 1024 * 1024
        },
        fileFilter: async (req: Express.Request, file: globalThis.Express.Multer.File, callback) => {
            ControllerHelper.writeLog("Upload.ts => Multer", `fileFilter - req.body: ${ControllerHelper.objectOutput(req.body)} / file: ${ControllerHelper.objectOutput(file)}`);

            file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");

            callback(null, await ControllerHelper.checkRequest(req, file));
        }
    });
};
