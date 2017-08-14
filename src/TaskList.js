import React from 'react';
import { List, Datagrid, TextField } from 'admin-on-rest';

export const TaskList = (props) => (
  <List {...props} perPage={30} filter={{ status__is_closed: false, assigned_to: localStorage.getItem('user_id') }} title="fg.todo_list">
    <Datagrid>
      <TextField source="id" />
      <TextField source="project_extra_info.name" label="Project" />
      <TextField source="subject"/>
      <TextField source="status_extra_info.name" label="Status"/>
      <TextField source="assigned_to_extra_info.full_name_display" label="Assignee"/>
    </Datagrid>
  </List>
);
