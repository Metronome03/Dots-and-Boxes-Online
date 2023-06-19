import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { UserProvider } from './User';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserProvider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </UserProvider>
);