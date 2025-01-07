import { IDatabaseConfig } from "../common/Config";
import { ISupplyData } from "../types";
import { Utils } from "../utils/Utils";
import { Storage } from "./Storage";

import MybatisMapper from "mybatis-mapper";

import path from "path";

export class SupplyStorage extends Storage {
    constructor(databaseConfig: IDatabaseConfig) {
        super(databaseConfig);
    }

    public async initialize() {
        await super.initialize();
        MybatisMapper.createMapper([path.resolve(Utils.getInitCWD(), "src/storage/mapper/table.xml")]);
        MybatisMapper.createMapper([path.resolve(Utils.getInitCWD(), "src/storage/mapper/supply.xml")]);
        await this.createTables();
    }

    public static async make(config: IDatabaseConfig): Promise<SupplyStorage> {
        const storage = new SupplyStorage(config);
        await storage.initialize();
        return storage;
    }

    public createTables(): Promise<any> {
        return this.queryForMapper("table", "create_table", {});
    }

    public async dropTestDB(): Promise<any> {
        await this.queryForMapper("table", "drop_table", {});
    }

    public postSupply(data: ISupplyData): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.queryForMapper("supply", "postSupply", {
                initial_supply: data.initial_supply.toString(),
                foundation: data.foundation.toString(),
                marketing1: data.marketing1.toString(),
                marketing2: data.marketing2.toString(),
                bounty: data.bounty.toString(),
                team_member: data.team_member.toString(),
                dwf: data.dwf.toString(),
                hold_airdrop: data.hold_airdrop.toString(),
                burned: data.burned.toString(),
                reward: data.reward.toString(),
                commons_budget: data.commons_budget.toString(),
                total_supply: data.total_supply.toString(),
                circulating_supply: data.circulating_supply.toString(),
            })
                .then(() => {
                    return resolve();
                })
                .catch((reason) => {
                    if (reason instanceof Error) return reject(reason);
                    return reject(new Error(reason));
                });
        });
    }

    public getSupply(): Promise<ISupplyData[]> {
        return new Promise<ISupplyData[]>(async (resolve, reject) => {
            this.queryForMapper("supply", "getSupply", {})
                .then((result) => {
                    return resolve(
                        result.rows.map((m) => {
                            return {
                                sequence: BigInt(m.sequence),
                                initial_supply: BigInt(m.initial_supply),
                                foundation: BigInt(m.foundation),
                                marketing1: BigInt(m.marketing1),
                                marketing2: BigInt(m.marketing2),
                                bounty: BigInt(m.bounty),
                                team_member: BigInt(m.team_member),
                                dwf: BigInt(m.dwf),
                                hold_airdrop: BigInt(m.hold_airdrop),
                                burned: BigInt(m.burned),
                                reward: BigInt(m.reward),
                                commons_budget: BigInt(m.commons_budget),
                                total_supply: BigInt(m.total_supply),
                                circulating_supply: BigInt(m.circulating_supply),
                            };
                        })
                    );
                })
                .catch((reason) => {
                    if (reason instanceof Error) return reject(reason);
                    return reject(new Error(reason));
                });
        });
    }

    public removeOver30Days(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.queryForMapper("supply", "removeOver30Days", {})
                .then(() => {
                    return resolve();
                })
                .catch((reason) => {
                    if (reason instanceof Error) return reject(reason);
                    return reject(new Error(reason));
                });
        });
    }

    public removeOverOneMin(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            this.queryForMapper("supply", "removeOverOneMin", {})
                .then(() => {
                    return resolve();
                })
                .catch((reason) => {
                    if (reason instanceof Error) return reject(reason);
                    return reject(new Error(reason));
                });
        });
    }
}
