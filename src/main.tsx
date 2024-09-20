import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import client from './apollo-client'; 
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
       <ApolloProvider client={client}>
         <App />
       </ApolloProvider>
  </React.StrictMode>,
)
