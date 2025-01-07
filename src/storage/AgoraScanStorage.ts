import { IDatabaseConfig } from "../common/Config";
import { Utils } from "../utils/Utils";
import { Storage } from "./Storage";

import MybatisMapper from "mybatis-mapper";

import path from "path";

import { BigNumber, ethers } from "ethers";

export class AgoraScanStorage extends Storage {
    constructor(databaseConfig: IDatabaseConfig) {
        super(databaseConfig);
    }

    public async initialize() {
        await super.initialize();
        MybatisMapper.createMapper([path.resolve(Utils.getInitCWD(), "src/storage/agora_scan/reward.xml")]);
        await this.createTables();
    }

    public static async make(config: IDatabaseConfig): Promise<AgoraScanStorage> {
        const storage = new AgoraScanStorage(config);
        await storage.initialize();
        return storage;
    }

    public getReward(): Promise<BigNumber> {
        return new Promise<BigNumber>(async (resolve, reject) => {
            this.queryForMapper("reward", "getReward", {})
                .then((result) => {
                    return resolve(BigNumber.from(result.rows[0].reward));
                })
                .catch((reason) => {
                    if (reason instanceof Error) return reject(reason);
                    return reject(new Error(reason));
                });
        });
    }
}
