import Express, { RequestHandler } from "express";
import * as Fs from "fs";
import * as Https from "https";
import BodyParser from "body-parser";
import CookieParser from "cookie-parser";
import Cors from "cors";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";
import * as ControllerConverter from "../Controller/Converter";
import * as ModelServer from "../Model/Server";

const corsOption: ModelServer.Cors = {
    originList: ControllerHelper.CORS_ORIGIN_URL,
    methodList: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 200
};

const app = Express();
app.use(Express.static(__dirname + process.env.PATH_STATIC));

const jsonParser = BodyParser.json() as RequestHandler;
const urlencodedParser = BodyParser.urlencoded({ extended: false }) as RequestHandler;

app.use(CookieParser());
app.use(
    Cors({
        origin: corsOption.originList,
        methods: corsOption.methodList,
        optionsSuccessStatus: corsOption.optionsSuccessStatus
    })
);

const server = Https.createServer(
    {
        key: Fs.readFileSync(ControllerHelper.PATH_CERTIFICATE_FILE_KEY as string),
        cert: Fs.readFileSync(ControllerHelper.PATH_CERTIFICATE_FILE_CRT as string)
    },
    app
);

server.listen(ControllerHelper.SERVER_PORT, () => {
    ControllerHelper.writeLog("ServerHttp.listen", `Listen on port ${ControllerHelper.SERVER_PORT}`);

    app.get("/", (req, resp) => {
        resp.send("ms file converter");
    });

    const multer = ControllerUpload.execute();
    ControllerConverter.execute(app, multer);
});
