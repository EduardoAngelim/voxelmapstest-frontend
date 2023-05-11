import { useEffect, useState } from "react";
import { FileHandleTypeEnum } from "../common/enums/file-handle-type";
import { Progress, Select, notification } from "antd";
import * as signalR from '@microsoft/signalr';
import FileHandleProgressModel from "../common/models/file-handle-progress.model";
import fileService from "../services/file.service";
import FileHandleModel from "../common/models/file-handle.model";
import EnvUrls from "../common/utils/environment-config";
import FileDescriptionModel from "../common/models/file-description.model";
import VoxelMapsLogo from "../assets/images/voxelmaps-logo.png"
import useModel from "../common/custom-hooks/useModel";
import RequestResult from "../common/utils/request-result";

const FileHandleView = () => {
    
    const [fileHandleProgressUpdate, setFileHandleProgressUpdate] = useState<FileHandleProgressModel>()
    const [sourceFilesList, setSourceFilesList] = useState<FileDescriptionModel[] | null>(null)
    const [destinationFoldersList, setDestinationFoldersList] = useState<string[] | null>(null)
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
    const [messageApi, contextHolder] = notification.useNotification()

    const requestInitialState = new FileHandleModel()
    const [operationRequest, setOperationRequest, setOperationRequestDataProp] = useModel<FileHandleModel>(requestInitialState)

    const { Option } = Select;

    useEffect(() => {
        getFiles()
    }, [])


    //Get the list of files and diretories
    const getFiles = async() => {
        setIsProgressModalOpen(false)
        setSourceFilesList(null)
        setDestinationFoldersList(null)
        setOperationRequest(requestInitialState)

        const request: RequestResult = await fileService.getFiles()
        console.log("REQ",request)
        if(!request){
            messageApi['error']({
                message: "Error when triyng to get files list.",
                description: "Please check the connection with the API.",
            });

            return;
        }

        if(request.hasError){
            messageApi['error']({
                message: request.message,
                description: request.execptionMessage,
            });
        }
        else{
            setSourceFilesList(request.result.sourceFiles)
            setDestinationFoldersList(request.result.destinationDirectories)
        }
    }


    //Add or Remove the selected files to handle
    const manageFilesToHandle = (add: boolean, file: FileDescriptionModel) => {
        if(add){
            const fileToHandle = `${file.filePath!}\\${file.fileName!}`
            const arr = operationRequest.filesToHandle
            arr?.push(fileToHandle)
            setOperationRequestDataProp("filesToHandle", arr)
        }
        else{
            const arr = operationRequest.filesToHandle.filter(x => !x.includes(file.fileName!))
            setOperationRequestDataProp("filesToHandle", arr)
        }
    }


    //Starts the connection with the SignalR Hub
    const startHubConnection = () => {
        const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${EnvUrls.API_URL}${EnvUrls.API_HUB_ENDPOINT}`, {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets
        }).build();

        connection.on("ProgressUpdate", (data: FileHandleProgressModel) => {
            if(data?.percentage){
                setFileHandleProgressUpdate(data);
            }
        });

        connection.on('ConnectionId', (connectionId) => {
            setOperationRequestDataProp("hubConnectionId", connectionId)
            startOperation(connectionId)
        });

        connection.start();
      
        return () => { connection.stop(); };
    }


    //Starts Copy/Move operation
    const startOperation = (hubConnectionId: string) => {
        let errors: string[] = []

        if(!operationRequest.type || operationRequest.type === FileHandleTypeEnum.None){
            errors.push("Please inform the operation type.")
        }

        if(!operationRequest.destinationFolder || operationRequest.destinationFolder === ""){
            errors.push("Please inform the destination path.")
        }

        if(!operationRequest.filesToHandle || operationRequest.filesToHandle.length === 0){
            errors.push("Please inform the file(s) you want to handle.")
        }

        if(errors.length > 0){
            messageApi['error']({
                message: 'We found some errors',
                description: 
                    <div className="errors-container">
                        <ul>
                            {
                                errors.map((err, idx) => {
                                    return <li key={idx}>{err}</li>
                                })
                            }
                        </ul>
                    </div> ,
            });
            return
        }

        setIsProgressModalOpen(true)

        operationRequest.hubConnectionId = hubConnectionId;

        fileService.handleFiles(operationRequest).then((response: RequestResult) => {
            if (response.hasError) {
                messageApi['error']({
                    message: response.message,
                    description: response.execptionMessage
                })
            }
            return response;
        }).then(data => {

        }).catch(error => {
            messageApi['error']({
                message: "Error during the operation!",
                description: error
            })
        });
    }


    //Cancel Copy/Move operation
    const cancelFileHandle = () => {
        if (operationRequest.hubConnectionId){
            fileService.cancelHandleFiles(operationRequest.hubConnectionId).then((response: RequestResult) => {
                if (response.hasError) {
                    messageApi['error']({
                        message: "Error when trying to cancel the operation",
                        description: response.execptionMessage
                    })
                }
                
                return response.result.json();
            }).then(data => {
                
            }).catch(error => {
                messageApi['error']({
                    message: "Error when trying to cancel the operation",
                    description: error
                })
            });
        }
    }


    return(
        <div>
            {contextHolder}
            <div className="header-container">
                <img src={VoxelMapsLogo} width={175} />
            </div>
            <div className="title-container">
                <h1>File Manager</h1>
                <p><button className="default-btn" onClick={() => startHubConnection()}>Start</button></p>
            </div>
            <div className="container">
                <div>
                    <h3>Files</h3>
                    <span><small>List of all files in the available folder on server. Select the files and what you wish to do (copy or move).</small></span><br/>
                    <Select style={{ width: '200px', margin: '10px 0 0 10px' }} size={'large'} placeholder="Operation Type" onChange={(opType) => setOperationRequestDataProp("type", opType)}>
                        <Option value={FileHandleTypeEnum.Copy}>Copy</Option>
                        <Option value={FileHandleTypeEnum.Move}>Move</Option>
                    </Select>
                    <ul className="files-list">
                        {
                            sourceFilesList?.map((file, idx) => {
                                return(<li key={idx}>
                                    <label className="checkbox-container">{file.fileName}
                                        <input type="checkbox" onChange={(e) => manageFilesToHandle(e.target.checked, file)} />
                                        <span className="checkbox-checkmark"></span>
                                    </label>
                                    <label>{file.filePath}</label>
                                </li>)
                            }) 
                        }
                    </ul>
                </div>
                
                <div>
                    <h3>Destination Folders</h3>
                    <span><small>List of all available destination folders on server. Select the destination folder.</small></span>
                    <ul className="directories-list">
                        {
                            destinationFoldersList?.map((dist, idx) => {
                                return(<li key={idx}>
                                    <label className="radiobutton-container">{dist}
                                        <input type="radio" name="dir" onChange={() => setOperationRequestDataProp("destinationFolder", dist)} />
                                        <span className="radiobutton-checkmark"></span>
                                    </label></li>)
                            }) 
                        }
                    </ul>
                </div>
            </div>

            <div id="myModal" className="modal" style={{display: isProgressModalOpen ? "block" : "none"}}>
                <div className="modal-content">
                    <Progress type="circle" percent={fileHandleProgressUpdate?.percentage!} status={fileHandleProgressUpdate?.isCanceled ? "exception" : "normal"} />
                    <p><b>{fileHandleProgressUpdate?.message}</b></p>
                    {
                        fileHandleProgressUpdate?.percentage! === 100 ||
                        fileHandleProgressUpdate?.isCanceled ?
                            <p><button className="default-btn" onClick={() => getFiles()}>Ok</button></p>:
                            <p><button className="default-btn" onClick={() => cancelFileHandle()}>Cancel</button></p>
                    }
                </div>
            </div>
        </div>)
}

export default FileHandleView