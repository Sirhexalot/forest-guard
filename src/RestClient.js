import { queryParameters, fetchJson } from 'admin-on-rest/lib/util/fetch';
import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE,
} from 'admin-on-rest/lib/rest/types';
import { fetchUtils } from 'admin-on-rest';
import { API_URL, IGNORE_USERS } from './consts';

/**
 * Maps admin-on-rest queries to a json-server powered REST API
 *
 * @see https://github.com/typicode/json-server
 * @example
 * GET_LIST     => GET http://my.api.url/posts?_sort=title&_order=ASC&_start=0&_end=24
 * GET_ONE      => GET http://my.api.url/posts/123
 * GET_MANY     => GET http://my.api.url/posts/123, GET http://my.api.url/posts/456, GET http://my.api.url/posts/789
 * UPDATE       => PUT http://my.api.url/posts/123
 * CREATE       => POST http://my.api.url/posts/123
 * DELETE       => DELETE http://my.api.url/posts/123
 */
const jsonServerRestClient = (apiUrl, httpClient = fetchJson) => {
    /**
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} { url, options } The HTTP request parameters
     */
    const convertRESTRequestToHTTP = (type, resource, params) => {
        let url = '';
        const options = {};
        switch (type) {
        case GET_LIST: {
            const { page } = params.pagination;
            const query = {
              page,
              ...params.filter
            };
            // Special case for /users : use /users/ID/contacts instead
            if (resource === 'users') {
              const user_id = localStorage.getItem('user_id');
              resource += `/${user_id}/contacts`;
            }
            url = `${apiUrl}/${resource}?${queryParameters(query)}`;
            break;
        }
        case GET_ONE:
            url = `${apiUrl}/${resource}/${params.id}`;
            break;
        case GET_MANY_REFERENCE: {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                ...params.filter,
                [params.target]: params.id,
                _sort: field,
                _order: order,
                _start: (page - 1) * perPage,
                _end: page * perPage,
            };
            url = `${apiUrl}/${resource}?${queryParameters(query)}`;
            break;
        }
        case UPDATE:
            url = `${apiUrl}/${resource}/${params.id}`;
            options.method = 'PUT';
            options.body = JSON.stringify(params.data);
            break;
        case CREATE:
            url = `${apiUrl}/${resource}`;
            options.method = 'POST';
            options.body = JSON.stringify(params.data);
            break;
        case DELETE:
            url = `${apiUrl}/${resource}/${params.id}`;
            options.method = 'DELETE';
            break;
        default:
            throw new Error(`Unsupported fetch action type ${type}`);
        }
        return { url, options };
    };

    /**
     * @param {Object} response HTTP response from fetch()
     * @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
     * @param {String} resource Name of the resource to fetch, e.g. 'posts'
     * @param {Object} params The REST request params, depending on the type
     * @returns {Object} REST response
     */
    const convertHTTPResponseToREST = (response, type, resource, params) => {
        const { headers, json } = response;
        let users = json;
        switch (type) {
        case GET_LIST:
        case GET_MANY_REFERENCE:
            if (!headers.has('x-pagination-count')) {
                throw new Error('The x-pagination-count header is missing in the HTTP Response. The jsonServer REST client expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare x-pagination-count in the Access-Control-Expose-Headers header?');
            }
            if (resource === 'users') {
              // Add current users
              const user_id = localStorage.getItem('user_id');
              const full_name = localStorage.getItem('full_name');
              // Remove ignored users if any
              if (IGNORE_USERS.length > 0) {
                users = json.filter(user => {
                  return IGNORE_USERS.indexOf(user.id.toString()) === -1;
                });
              }
              return {
                data: [{
                  id: user_id,
                  full_name: full_name,
                }].concat(users),
                total: parseInt(headers.get('x-pagination-count').split('/').pop(), 10),
              };
            }
            return {
                data: json,
                total: parseInt(headers.get('x-pagination-count').split('/').pop(), 10),
            };
        case CREATE:
            return { data: { ...params.data, id: json.id } };
        default:
          return { data: json };
        }
    };

    /**
     * @param {string} type Request type, e.g GET_LIST
     * @param {string} resource Resource name, e.g. "posts"
     * @param {Object} payload Request parameters. Depends on the request type
     * @returns {Promise} the Promise for a REST response
     */
    return (type, resource, params) => {
        // json-server doesn't handle WHERE IN requests, so we fallback to calling GET_ONE n times instead
        if (type === GET_MANY) {
            return Promise.all(params.ids.map(id => httpClient(`${apiUrl}/${resource}/${id}`)))
                .then(responses => ({ data: responses.map(response => response.json) }));
        }
        const { url, options } = convertRESTRequestToHTTP(type, resource, params);
        return httpClient(url, options)
            .then(response => convertHTTPResponseToREST(response, type, resource, params));
    };
};

export default jsonServerRestClient;

/**
 * A simple htt client that uses token as authorization bearer
 * @param {*} url
 * @param {*} options
 */
const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
}

export const restClient = jsonServerRestClient(API_URL, httpClient);
