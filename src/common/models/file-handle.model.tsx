import { FileHandleTypeEnum } from "../enums/file-handle-type";

export default class FileHandleModel {
    public type: FileHandleTypeEnum | null = null;
    public hubConnectionId: string | null = null;
    public destinationFolder: string | null = null;
    public filesToHandle: string[] = [];
}