import Frak from './Frak';

export default class ResidentProvider
{

    constructor(baseUrl, apiKey)
    {
        this._frak = new Frak();
        this._baseURL = baseUrl;
        this._apiKey = apiKey;
    }

    query(value, column)
    {
        let uri = this._baseURL + 'resident/query/'+ value + '?';
        if (value !== '*') {
            uri += '?column=' + column;
        }
        uri += 'api_key=' + this._apiKey;

        return this._frak.get(uri)
        .then((response) => {
            console.log('response', response);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.toString());
            }
        })
        .catch((err) => {
            console.error(err);
            alert('problem');
        });
    }

    read(id)
    {
        return this._frak.get(this._baseURL + 'resident/'+ id + '?api_key=' + this._apiKey)
        .then((response) => {
            console.log('response', response);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.toString());
            }
        })
        .catch((err) => {
            console.error(err);
            alert('problem');
        });
    }
}