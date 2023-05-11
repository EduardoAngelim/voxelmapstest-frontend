import FileHandleModel from "../common/models/file-handle.model";
import requestHandle from "../common/utils/request-handle";

const controller = "Files";

const getFiles = async() => { return await requestHandle('get', `api/${controller}/list-files-directories`, null) }
const handleFiles = async(data: FileHandleModel) => { return await requestHandle('post', `api/${controller}/handle-files`, data) }
const cancelHandleFiles = async(hubConnectionId: string) => { return await requestHandle('post', `api/${controller}/cancel-handle-files/${hubConnectionId}`, null) }

export default { getFiles, handleFiles, cancelHandleFiles }