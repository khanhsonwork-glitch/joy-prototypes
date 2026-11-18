import React from 'react';
import PointsHome from './PointsHome.jsx';
import Editor from './Editors.jsx';
import PointSettings from './PointSettings.jsx';
import './points.css';
export function resolvePoints(segments,query){if(segments[0]!=='programs'||segments[1]!=='points')return null;if(segments[2]==='settings')return <PointSettings/>;if(segments[2]==='earn'&&segments[3])return <Editor kind="earn" id={segments[3]} query={query}/>;if(segments[2]==='rewards'&&segments[3])return <Editor kind="redeem" id={segments[3]} query={query}/>;return <PointsHome/>}
