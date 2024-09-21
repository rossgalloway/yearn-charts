import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import ErrorBoundary from './ErrorBoundary.tsx';
import client from './apollo-client';
import AppWrapper from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <AppWrapper />
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
