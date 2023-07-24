import './global.css'
import DragDrop from './components/DragZone'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <main>
      <Toaster />
      <DragDrop />
    </main>
  )
}

export default App
