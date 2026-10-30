// Reward programs › Earning programs: the entry to the Submit form program (menu → list → Edit).
import React from 'react';
import {Badge, Button, Card, IndexTable, Page, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';

const PROGRAMS = [
  {id: 'p1', name: 'Place an order', reward: '1 point for every $1 spent', status: 'Active'},
  {id: 'p2', name: 'Sign up', reward: '100 points', status: 'Active'},
  {id: 'p3', name: 'Celebrate a birthday', reward: '200 points', status: 'Active'},
  {id: 'sf', name: 'Bought elsewhere? Get points', type: 'Submit form', reward: '200 points', status: 'Active', url: '/demo/submit-form'},
];

export function ProgramsPage() {
  const {notYet} = useShell();
  return (
    <Page title="Reward programs" subtitle="Earning programs">
      <Card padding="0">
        <IndexTable resourceName={{singular: 'program', plural: 'programs'}} itemCount={PROGRAMS.length} selectable={false} headings={[{title: 'Program'}, {title: 'Reward'}, {title: 'Status'}, {title: ''}]}>
          {PROGRAMS.map((p, i) => (
            <IndexTable.Row id={p.id} key={p.id} position={i}>
              <IndexTable.Cell>
                <Text as="span" fontWeight="semibold">{p.name}</Text>
                {p.type ? <Text as="span" tone="subdued">{` · ${p.type}`}</Text> : null}
              </IndexTable.Cell>
              <IndexTable.Cell>{p.reward}</IndexTable.Cell>
              <IndexTable.Cell><Badge tone="success">{p.status}</Badge></IndexTable.Cell>
              <IndexTable.Cell>{p.url ? <Button url={p.url}>Edit</Button> : <Button onClick={notYet}>Edit</Button>}</IndexTable.Cell>
            </IndexTable.Row>
          ))}
        </IndexTable>
      </Card>
    </Page>
  );
}
