import {IClientProvider} from 'providers/ClientProvider';
import {TClient} from 'reactn/default';
import {ClientRecord} from 'types/RecordTypes';
import {asyncWrapper} from 'utility/common';

type DeleteResponse = {success: boolean};

export interface IClientManager {
    deleteClient: (clientId: number) => Promise<boolean>;
    loadClientList: () => Promise<ClientRecord[]>;
    loadClient: (clientId: number) => Promise<TClient>;
    updateClient: (r: ClientRecord) => Promise<ClientRecord>;
}

/**
 * ClientManager handles business logic for updating, deleting, and loading Client data.
 * @param {IClientProvider} clientProvider The client provider "class" object
 */
const ClientManager = (clientProvider: IClientProvider): IClientManager => {
    /**
     * Inserts or updates a Client record.
     * @param {ClientRecord} clientRecord The client record object
     */
    const _updateClient = async (clientRecord: ClientRecord): Promise<ClientRecord> => {
        const [e, r] = (await asyncWrapper(clientProvider.post(clientRecord))) as [unknown, Promise<ClientRecord>];
        if (e) throw e;
        else return r;
    };

    /**
     * Loads the Client object
     * @param {number} clientId The PK of the client
     */
    const _loadClient = async (clientId: number) => {
        const [e, r] = (await asyncWrapper(clientProvider.load(clientId))) as [unknown, Promise<TClient>];
        if (e) throw e;
        else return r;
    };

    /**
     * Deletes a Client record
     * @param {number} clientId The PK of the Client table
     */
    const _deleteClient = async (clientId: number) => {
        const [e, r] = (await asyncWrapper(clientProvider.delete(clientId))) as [unknown, Promise<DeleteResponse>];
        if (e) throw e;
        else return (await r).success;
    };

    /**
     * Gets ALL the clients from the Client table
     */
    const _loadClientList = async () => {
        const searchCriteria = {
            orderBy: [
                ['LastName', 'asc'],
                ['FirstName', 'asc']
            ]
        };
        const [e, r] = (await asyncWrapper(clientProvider.search(searchCriteria))) as [
            unknown,
            Promise<ClientRecord[]>
        ];
        if (e) throw e;
        else return r;
    };

    return <IClientManager>{
        deleteClient: async (clientId: number): Promise<boolean> => {
            return await _deleteClient(clientId);
        },
        loadClient: async (clientId: number): Promise<TClient> => {
            return await _loadClient(clientId);
        },
        loadClientList: async (): Promise<ClientRecord[]> => {
            return await _loadClientList();
        },
        updateClient: async (clientRecord: ClientRecord): Promise<ClientRecord> => {
            return await _updateClient(clientRecord);
        }
    };
};

export default ClientManager;
