import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';
import AppWrapper from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AppWrapper />
    </ApolloProvider>
  </React.StrictMode>,
);
