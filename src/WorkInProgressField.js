import React from 'react';
import PropTypes from 'prop-types';
import { ReferenceManyField, SingleFieldList } from 'admin-on-rest';
import TaskField from './TaskField';

const WorkInProgressField = ({ source, record = {}, ...props }) => <span>
  <ReferenceManyField label="Issues" reference="issues" target="assigned_to" filter={{ status__is_closed: false }} record={record} {...props}>
    <SingleFieldList>
      <TaskField source="id" type="issue" record={record} {...props}/>
    </SingleFieldList>
  </ReferenceManyField>
  <ReferenceManyField label="Tasks" reference="tasks" target="assigned_to" filter={{ status__is_closed: false }} record={record} {...props}>
    <SingleFieldList>
      <TaskField source="id" type="task" record={record} {...props}/>
    </SingleFieldList>
  </ReferenceManyField>
</span>;

WorkInProgressField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

export default WorkInProgressField;
