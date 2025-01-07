import dotenv from "dotenv";
import { Config } from "./common/Config";
import { logger } from "./common/Logger";
import { DefaultServer } from "./DefaultServer";
import { Scheduler } from "./scheduler/Scheduler";
import { SupplyScheduler } from "./scheduler/SupplyScheduler";
import { AgoraScanStorage } from "./storage/AgoraScanStorage";
import { SupplyStorage } from "./storage/SupplyStorage";
import { Utils } from "./utils/Utils";

dotenv.config({ path: "env/.env" });

let server: DefaultServer;

async function main() {
    const config = Config.createWithArgument();

    logger.transports.forEach((tp) => {
        tp.level = config.logging.level;
    });

    logger.info(`address: ${config.server.address}`);
    logger.info(`port: ${config.server.port}`);

    await Utils.delay(1000);
    const supply_storage = await SupplyStorage.make(config.database);
    const agora_scan_storage = await AgoraScanStorage.make(config.agora_scan_database);

    const schedulers: Scheduler[] = [];
    if (config.scheduler.enable) {
        const scheduler = config.scheduler.getScheduler("boa");
        if (scheduler && scheduler.enable) {
            schedulers.push(new SupplyScheduler(scheduler.expression));
        }
    }

    server = new DefaultServer(config, supply_storage, agora_scan_storage, schedulers);
    return server.start().catch((error: any) => {
        switch (error.code) {
            case "EACCES":
                logger.error(`${config.server.port} requires elevated privileges`);
                break;
            case "EADDRINUSE":
                logger.error(`Port ${config.server.port} is already in use`);
                break;
            default:
                logger.error(`An error occurred while starting the server: ${error.stack}`);
        }
        process.exit(1);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

process.on("SIGINT", () => {
    server.stop().then(() => {
        process.exit(0);
    });
});
