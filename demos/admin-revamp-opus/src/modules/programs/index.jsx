// Programs module: All programs, Points (./points), Referrals, Milestones, Quizzes.
import React from 'react';
import {resolvePoints} from './points/index.jsx';
import {AllPrograms} from './AllPrograms.jsx';
import {Referrals} from './Referrals.jsx';
import {MilestoneEditor, MilestoneList} from './Milestones.jsx';
import {QuizBuilder, QuizList} from './Quizzes.jsx';

export function resolve(segments, query) {
  if (segments[0] !== 'programs') return null;
  const [, sub, id] = segments;
  if (!sub) return <AllPrograms />;
  if (sub === 'points') return resolvePoints(segments, query);
  if (sub === 'referrals') return <Referrals />;
  if (sub === 'milestones') return id ? <MilestoneEditor key={id + query.toString()} id={id} query={query} /> : <MilestoneList />;
  if (sub === 'quizzes') return id ? <QuizBuilder key={id + query.toString()} id={id} query={query} /> : <QuizList />;
  return null;
}
