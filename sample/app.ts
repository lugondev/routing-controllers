import "reflect-metadata";
import {Action, ServerLoader, ServerSettings, UnauthorizedError, useContainer} from "express-lugon";
import {Container} from "typedi";
// import {getEntityManager, TYPE_AUTHORIZATION} from "./models";
import {$log} from "ts-log-debug";
import "./logger/Logger"
// import {ErrorsHandler} from "./middlewares";
// import {Maintenance} from "./middlewares";
import * as path from "path";
// import * as express from "express";
// import {ErrorMsg} from "./constants";
// import {Request} from "express";
// import {LicenseError} from "./middlewares/LicenseError";

useContainer(Container);
export const rootDir = __dirname;
export const rootPath = () => {
    if (rootDir.endsWith("/dist")) {
        return path.resolve(rootDir, "..");
    } else {
        return rootDir;
    }
};

export const ADMIN_USER_ID = "5bb7c41373535c0d194f1916";

require("dotenv").load();
console.log("environment: ", process.env.NODE_ENV);

// export const accessTokenDetect = function (request: Request) {
//     const authorizationHeader = request.headers["authorization"];
//     const accessTokenQuery = !!request.query ? request.query.access_token || "" : "";
//     const accessTokenBody = !!request.body ? request.body.access_token || "" : "";
//     const accessTokenHeader = (!authorizationHeader || TYPE_AUTHORIZATION.indexOf(authorizationHeader.split(" ")[0]) === -1) ? "" : authorizationHeader.split(" ")[1];
//     return accessTokenHeader ? accessTokenHeader : accessTokenBody ? accessTokenBody : accessTokenQuery;
// };

@ServerSettings({
    port: process.env.PORT || 3333,
    rootDir,
    required: [
        // rootDir + "/models/mongoose",
        // rootDir + "/modules/dc",
    ],
    options: {
        defaults: {
            nullResultCode: 404,//"express-lugon": "file:/Users/lugondev/DEV/express-lugon",
            undefinedResultCode: 520,
            paramOptions: {
                required: true,
            }
        },
        cors: true,
        defaultErrorHandler: false,
        controllers:
            [
                rootDir + "/controllersTest/*{.js,.ts}",
                // rootDir + "/controllers/*{.js,.ts}",
                // rootDir + "/controllers/admin/*{.js,.ts}",
                // rootDir + "/controllers/facebookController/*{.js,.ts}",
            ],
        middlewares: [
            // ErrorsHandler
        ],
        authorizationChecker: async (action: Action, roles: string[]) => {
            // if (roles)
            //     console.log("roles: ", roles);
            //
            // const accessToken = accessTokenDetect(action.request);
            // if (accessToken === "") {
            //     throw new UnauthorizedError(ErrorMsg.INVALID_TOKEN);
            // }
            // action.request["aim_access_token"] = accessToken;
            //
            // const authorizedUser = await getEntityManager.authorizeByToken(accessToken);
            //
            // const site = await getEntityManager.site();
            // if (site.maintenance && !authorizedUser.is_admin) {
            //     throw new Maintenance("Site is maintenance.");
            // }
            // if (!authorizedUser || !authorizedUser.is_activated) {
            //     return false;
            // }
            // if (!roles.length || authorizedUser.is_admin) {
            //     return true;
            // }
            //
            // const rolePermissions = authorizedUser.role ? authorizedUser.role.permissions : [];
            // const customPermissions = authorizedUser.permissions ? authorizedUser.permissions : [];
            // return !!(roles.find(role => [...rolePermissions, ...customPermissions].indexOf(role) !== -1))
            return true;
        },
        currentUserChecker: (action: Action) => {
            // return getEntityManager.authorizeByToken(accessTokenDetect(action.request));
        }
    }
})

export class Server extends ServerLoader {

    $onInit(): void {
        console.log(rootPath());

        const morgan = require('morgan'),
            cookieParser = require('cookie-parser'),
            bodyParser = require('body-parser'),
            compress = require('compression');

        // function isLoggedIn(req: Request, res, next) {
        //     if (req.query.force === "admin") {
        //         console.log("get file: " + req.originalUrl);
        //         next()
        //     } else {
        //         const accessToken = accessTokenDetect(req);
        //         if (!!accessToken) {
        //             getEntityManager.authorizeByToken(accessToken)
        //                 .then(user => {
        //                     if (user && (user.is_admin || user.is_mod || user.permissions.indexOf("aim.app") != -1)) {
        //                         console.log("get file: " + req.originalUrl);
        //                         next();
        //                     } else throw new LicenseError(ErrorMsg.AIM_ERROR)
        //                 })
        //         } else throw new LicenseError(ErrorMsg.AIM_ERROR);
        //     }
        // }
        //
        // this.expressApp.use("/files", isLoggedIn, express.static(path.join(rootPath(), 'files')));
        // this.expressApp.use("/files-public", express.static(path.join(rootPath(), 'files/public')));

        this
            .use(morgan('dev'))
            .use(cookieParser())
            .use(compress({}))
            .use(bodyParser.json({limit: '50mb', extended: true}))
            .use(bodyParser.raw({limit: '50mb', extended: true}))
            .use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    }

    $onCreateServer(httpServer) {
        // let io = require('socket.io')(httpServer);
        //
        // io.on('connection', function (socket) {
        //     console.log('Connected... ' + socket.id);
        //     socket.on("disconnect", function () {
        //         console.log("Disconnect: ", socket.id);
        //     });
        //     socket.on("join", function (room) {
        //         console.log("join room: " + socket.id);
        //         socket.join(room);
        //     })
        // });
    }

    $onReady() {
        $log.debug('Server initialized')
    }

    $onServerInitError(error): any {
        $log.error('Server encounter an error =>', JSON.stringify(error));
    }
}

new Server()
    .start()
    .then(() => {
        $log.info('Server started...');
    })
    .catch((err) => {
        $log.error(err);
    });
