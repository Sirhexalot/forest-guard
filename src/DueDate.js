import Moment from 'react-moment';
import React, { Component } from 'react';
import { fetchUtils } from 'admin-on-rest';
import jsonServerRestClient from './RestClient.js';
import { GET_ONE } from 'admin-on-rest/lib/rest/types';
import { API_URL, BASE_URL, DUE_DATE_CUSTOM_ATTRIBUTES } from './consts';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
}

const restClient = jsonServerRestClient(API_URL, httpClient);

class DueDate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      custom_attributes: {}
    };
  }

  componentDidMount() {
    const BASE_TYPE = this.props.type + 's';
    restClient(GET_ONE, BASE_TYPE + '/custom-attributes-values', this.props.record).then(response => {
      this.setState({ custom_attributes: response.data.attributes_values })
    });
  }

  render() {
    const dueDate = typeof this.state.custom_attributes[DUE_DATE_CUSTOM_ATTRIBUTES[this.props.record.project][this.props.type]] !== 'undefined' ? this.state.custom_attributes[DUE_DATE_CUSTOM_ATTRIBUTES[this.props.record.project][this.props.type]] : null;
    const dueDateDisplay = dueDate ? <span>
      <span className='important-dates--label important-dates--label__right'>Due date: </span>
      <Moment format='L'>{dueDate}</Moment>
    </span> : null;

    return (
      <span className='important-dates'>
        <span>
          <span className='important-dates--label'>Created on: </span>
          <Moment format='L'>{this.props.record.created_date}</Moment>
        </span>
        {dueDate ? <span>&nbsp;|&nbsp;</span> : null}
        {dueDateDisplay}
      </span>
    );
  }
}

export default DueDate;
