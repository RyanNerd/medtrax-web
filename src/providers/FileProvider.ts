import Frak from 'frak/lib/components/Frak';
import {FileRecord} from 'types/RecordTypes';

export interface IFileProvider {
    setApiKey: (apiKey: string) => void;
    download: (fileRecord: FileRecord) => Promise<void>;
    update: (fileRecord: FileRecord) => Promise<FileRecord>;
    uploadFile: (formData: FormData, clientId: number) => Promise<FileUploadRecord>;
    load: (clientId: number) => Promise<FileRecord[]>;
}

type FileUploadRecord = {
    Id: number | null;
    Size: number;
    FileName: string;
    Type: string | null;
};

type UpdateResponse = {
    status: number;
    success: boolean;
    data: null | FileRecord;
};

type UploadResponse = {
    status: number;
    success: boolean;
    data: null | FileUploadRecord;
};

type LoadResponse = {
    status: number;
    success: boolean;
    data: FileRecord[];
};

const FileProvider = (baseUrl: string): IFileProvider => {
    const _baseUrl = baseUrl;
    const _frak = Frak();
    let _apiKey = null as string | null;

    return {
        /**
         * Set the apiKey
         * @param {string} apiKey The API key to use
         */
        setApiKey: (apiKey: string) => {
            _apiKey = apiKey;
        },

        /**
         * Insert or update a File record
         * @param {FileRecord} fileRecord The file record object
         * @returns {Promise<FileRecord>} An updated file record object as a promise
         */
        update: async (fileRecord: FileRecord): Promise<FileRecord> => {
            const uri = `${_baseUrl}file?api_key=${_apiKey}`;
            const response = await _frak.post<UpdateResponse>(uri, fileRecord);
            if (response.success) {
                return response.data as FileRecord;
            } else {
                throw response;
            }
        },

        /**
         * Upload a file as a FormData object. Note that Frak isn't used because the data sent is not JSON
         * @param {FormData} formData The FormData object containing the name and file
         * @param {number} clientId The Client PK
         * @returns {Promise<FileUploadRecord>} A FileUploadRecord object as a promise
         */
        uploadFile: async (formData: FormData, clientId): Promise<FileUploadRecord> => {
            const uri = _baseUrl + 'file/upload/' + clientId + '?api_key=' + _apiKey;
            const response = await fetch(uri, {
                method: 'POST',
                body: formData,
                headers: {
                    Accept: 'application/json'
                }
            });

            const responseJSON = (await response.json()) as UploadResponse;
            if (responseJSON.success) {
                return responseJSON.data as FileUploadRecord;
            } else {
                throw response;
            }
        },

        /**
         * Given a clientId (Resident PK) return all the File records for the client
         * @param {number} clientId Client (Resident) PK
         * @returns {Promise<FileRecord[]>} An array of FileRecords
         */
        load: async (clientId: number): Promise<FileRecord[]> => {
            const uri = `${_baseUrl}file/load/${clientId}?api_key=${_apiKey}`;
            const response = await _frak.get<LoadResponse>(uri);
            if (response.success) {
                return response.data as FileRecord[];
            } else {
                if (response.status === 404) {
                    return [] as FileRecord[];
                }
                throw response;
            }
        },

        /**
         * Given a FileRecord object download the file
         * @param {FileRecord} fileRecord The FileRecord object to download
         * @link https://codesandbox.io/s/fetch-based-file-download-0kxod?file=/src/index.js:541-573
         * @returns {Promise<void>}
         */
        download: async (fileRecord: FileRecord): Promise<void> => {
            const uri = `${_baseUrl}file/download/${fileRecord.Id}?api_key=${_apiKey}`;
            const response = await fetch(uri, {
                method: 'GET',
                headers: {
                    Accept: 'application/octet-stream'
                }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileRecord.FileName;
            document.body.append(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };
};

export default FileProvider;
