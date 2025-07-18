import type {IModule} from "@/modules/IModule.ts";

export interface IUserProvider  extends IModule{
    getUserInfo: () => Promise<void>;

}