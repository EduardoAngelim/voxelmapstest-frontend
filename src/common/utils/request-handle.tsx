import axios from "axios";
import EnvUrls from "./environment-config";

const requestHandle = async(method: string, endpoint: string, data: any) => {
    const api = axios.create({ baseURL: EnvUrls.API_URL })
    
    api.interceptors.request.use(function (config) {
        return config
      }, function (error) {
        return Promise.reject(error)
      }
    );
    
    api.interceptors.response.use(function (response) {
        return response
      },
      function (error) {
        return Promise.reject(error);
      }
    );
      
    return await api({
        method: method,
        url: endpoint,
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((result) => {
        return result.data
    }).catch((error) => {
        return error.response?.data
    })
}

export default requestHandle