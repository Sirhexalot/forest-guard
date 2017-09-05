// in src/App.js
import React from 'react';
import { Admin, Resource, englishMessages, resolveBrowserLocale } from 'admin-on-rest';
import frenchMessages from 'aor-language-french';
import germanMessages from 'aor-language-german';
import WorkIcon from 'material-ui/svg-icons/action/work';
import BugIcon from 'material-ui/svg-icons/action/bug-report';
import TaskIcon from 'material-ui/svg-icons/action/extension';
import authClient from './authClient';
import { UserList } from './UserList';
import { TaskList } from './TaskList';
import { restClient } from './RestClient';
import domainMessages from './i18n';

const messages = {
  fr: { ...frenchMessages, ...domainMessages.fr },
  en: { ...englishMessages, ...domainMessages.en },
  de: { ...germanMessages, ...domainMessages.de },
};

const App = () => (
  <Admin title="Forest Guard" restClient={restClient} authClient={authClient} locale={resolveBrowserLocale()} messages={messages}>
    <Resource name="users" list={UserList} icon={WorkIcon} />
    <Resource name="issues" list={TaskList} title="fg.assigned_issues" icon={BugIcon} />
    <Resource name="tasks" list={TaskList} title="fg.assigned_tasks" icon={TaskIcon} />
    <Resource name="project" />
  </Admin>
);

export default App;
