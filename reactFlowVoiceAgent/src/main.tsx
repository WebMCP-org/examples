import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import reportWebVitals from './reportWebVitals';

import './index.css'
import App from './App.tsx'

import { LLMProvider } from './ai/llmContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LLMProvider>
        <App />
    </LLMProvider>
  </StrictMode>,
)

// reportWebVitals();