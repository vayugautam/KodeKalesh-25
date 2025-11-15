import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'

/**
 * Global keyboard shortcuts for power users
 */
const useKeyboardShortcuts = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ignore shortcuts when typing in input fields
      const activeElement = document.activeElement
      const isInputFocused = 
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.isContentEditable

      if (isInputFocused) return

      // Keyboard shortcuts with Ctrl/Cmd key
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'm':
            event.preventDefault()
            navigate('/map')
            enqueueSnackbar('Navigated to Map', { variant: 'info', autoHideDuration: 1500 })
            break
          case 'h':
            event.preventDefault()
            navigate('/home')
            enqueueSnackbar('Navigated to Home', { variant: 'info', autoHideDuration: 1500 })
            break
          case 'a':
            event.preventDefault()
            navigate('/alerts')
            enqueueSnackbar('Navigated to Alerts', { variant: 'info', autoHideDuration: 1500 })
            break
          case 'r':
            event.preventDefault()
            navigate('/reports')
            enqueueSnackbar('Navigated to Reports', { variant: 'info', autoHideDuration: 1500 })
            break
          case 'k':
            event.preventDefault()
            showShortcutsHelp()
            break
          default:
            break
        }
      }

      // Single key shortcuts
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        switch (event.key) {
          case '?':
            event.preventDefault()
            showShortcutsHelp()
            break
          case 'Escape':
            // Close modals/dialogs (handled by components)
            break
          default:
            break
        }
      }
    }

    const showShortcutsHelp = () => {
      const shortcuts = [
        'Ctrl+M - Go to Map',
        'Ctrl+H - Go to Home',
        'Ctrl+A - Go to Alerts',
        'Ctrl+R - Go to Reports',
        'Ctrl+K or ? - Show shortcuts',
        'Esc - Close dialogs',
      ]
      
      enqueueSnackbar(
        <div>
          <strong>Keyboard Shortcuts</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {shortcuts.map((shortcut, idx) => (
              <li key={idx} style={{ fontSize: '0.875rem' }}>{shortcut}</li>
            ))}
          </ul>
        </div>,
        { 
          variant: 'info',
          autoHideDuration: 8000,
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        }
      )
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [navigate, enqueueSnackbar])
}

export default useKeyboardShortcuts
