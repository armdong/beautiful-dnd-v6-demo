import React from 'react';
import { render } from 'react-dom';
import GridColumnConfiger from './components/GridColumnConfiger';
import './index.css';
import columns from './data';
import getEntites from './entities';

render(
  <GridColumnConfiger entities={getEntites(columns)} />,
  document.querySelector('#root')
)