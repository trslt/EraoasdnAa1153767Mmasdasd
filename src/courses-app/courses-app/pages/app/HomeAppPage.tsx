import React from 'react';
import {
  Block,
  Card,
  BlockTitle,
} from 'konsta/react';
import { AuthUser } from 'wasp/auth';

export default function HomeAppPage({ user }: { user: AuthUser }) {
  
  return (
    <>
      <Block inset className="space-y-4">
        <h1>Ciao, { user.firstName }</h1>
        <p>
          <b>Riprendi da dove hai lasciato</b>
        </p>
      </Block>

      <BlockTitle withBlock={false}>I miei progressi</BlockTitle>

      <div className="lg:grid lg:grid-cols-2">
        <Card header="Prompt, chi parla?" footer="Jacopo Perfetti e Federico Favot">
          Card with header and footer. Card headers are used to display card
          titles and footers for additional information or just for custom
          actions.
        </Card>
      </div>
    </>
  );
}



