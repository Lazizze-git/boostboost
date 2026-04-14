import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import App from './app/App.tsx'
import { PublicProfile } from './app/pages/PublicProfile.tsx'
import { TapRedirect } from './app/pages/TapRedirect.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/p/:username" element={<PublicProfile />} />
      <Route path="/tap/:tapId" element={<TapRedirect />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
)
