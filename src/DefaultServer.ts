import bodyParser from "body-parser";
import cors from "cors";
import { Config } from "./common/Config";
import { DefaultRouter } from "./routers/DefaultRouter";
import { WebService } from "./service/WebService";

import { register } from "prom-client";
import { Metrics } from "./metrics/Metrics";
import { Scheduler } from "./scheduler/Scheduler";
import { AgoraScanStorage } from "./storage/AgoraScanStorage";
import { SupplyStorage } from "./storage/SupplyStorage";

export class DefaultServer extends WebService {
    private readonly config: Config;
    private readonly metrics: Metrics;
    protected schedules: Scheduler[] = [];
    public readonly supply_storage: SupplyStorage;
    public readonly agora_scan_storage: AgoraScanStorage;

    public readonly router: DefaultRouter;

    constructor(
        config: Config,
        supply_storage: SupplyStorage,
        agora_scan_storage: AgoraScanStorage,
        schedules?: Scheduler[]
    ) {
        super(config.server.port, config.server.address);
        register.clear();
        this.metrics = new Metrics();
        this.metrics.create("gauge", "status", "serve status");
        this.metrics.create("summary", "success", "request success");
        this.metrics.create("summary", "failure", "request failure");

        this.config = config;
        this.supply_storage = supply_storage;
        this.agora_scan_storage = agora_scan_storage;
        this.router = new DefaultRouter(this, this.config, this.metrics, this.supply_storage);

        if (schedules) {
            schedules.forEach((m) => this.schedules.push(m));
            this.schedules.forEach((m) =>
                m.setOption({
                    config: this.config,
                    supply_storage: this.supply_storage,
                    agora_scan_storage: this.agora_scan_storage,
                    metrics: this.metrics,
                })
            );
        }
    }

    public async start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false, limit: "1mb" }));
        // parse application/json
        this.app.use(bodyParser.json({ limit: "1mb" }));
        this.app.use(
            cors({
                origin: "*",
                methods: "GET, OPTIONS",
                allowedHeaders: "Content-Type, Authorization",
                credentials: true,
                preflightContinue: false,
            })
        );

        this.router.registerRoutes();

        for (const m of this.schedules) await m.start();

        return super.start();
    }

    public stop(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            for (const m of this.schedules) await m.stop();
            for (const m of this.schedules) await m.waitForStop();
            if (this.server != null) {
                this.server.close((err?) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else resolve();
        });
    }
}
