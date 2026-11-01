import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import './style-lab.css'
import StyleLab from './StyleLab'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyleLab />
  </StrictMode>,
)
