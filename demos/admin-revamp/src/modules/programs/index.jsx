import React from 'react';
import {resolvePoints} from './points/index.jsx';
import {Overview} from './overview.jsx';
import {Referrals} from './referrals.jsx';
import {MilestoneList, MilestoneEditor} from './milestones.jsx';
import {QuizList, QuizEditor} from './quizzes.jsx';

export function resolve(segments, query) {
  if (segments[0] !== 'programs') return null;
  if (segments[1] === 'points') return resolvePoints(segments, query);
  if (!segments[1]) return <Overview />;
  if (segments[1] === 'referrals') return <Referrals />;
  if (segments[1] === 'milestones') return segments[2] ? <MilestoneEditor key={segments[2]} id={segments[2]} query={query} /> : <MilestoneList />;
  if (segments[1] === 'quizzes') return segments[2] ? <QuizEditor key={segments[2]} id={segments[2]} query={query} /> : <QuizList />;
  return null;
}
