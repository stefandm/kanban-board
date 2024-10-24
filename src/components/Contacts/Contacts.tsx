// Contacts.tsx
import React from 'react';
import ContactsLogic, { ContactsLogicProps } from './ContactsLogic';
import ContactsUI from './ContactsUI';

const Contacts: React.FC = () => {
  return (
    <ContactsLogic>
      {(logicProps: ContactsLogicProps) => <ContactsUI {...logicProps} />}
    </ContactsLogic>
  );
};

export default Contacts;
