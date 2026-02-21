import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import Routepage from './Routing/Routepage'
import { Provider } from 'react-redux'
import {store} from './Redux/Store/Store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routepage />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
