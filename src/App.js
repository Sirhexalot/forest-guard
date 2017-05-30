// in src/App.js
import React from 'react';
import { Admin, Resource, fetchUtils } from 'admin-on-rest';
import authClient from './authClient';
import jsonServerRestClient from './RestClient';

import { UserList } from './UserList';
import { TaskList } from './TaskList';
import { API_URL } from './consts';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('token');
    options.headers.set('Authorization', `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
}

const restClient = jsonServerRestClient(API_URL, httpClient);

const App = () => (
    <Admin title="Forest Guard" restClient={restClient} authClient={authClient}>
        <Resource name="users" list={UserList} options={{ label: 'Work In Progress' }}/>
        <Resource name="tasks" list={TaskList} options={{ label: 'Open Tasks' }} />
        <Resource name="issues" list={TaskList} options={{ label: 'Open Issues' }}/>
        <Resource name="project" />
    </Admin>
);

export default App;
