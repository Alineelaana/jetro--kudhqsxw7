import { Component, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

interface ErrorBoundaryProps extends Props {
  locationPath?: string
}

interface ErrorBoundaryState extends State {
  prevPath?: string
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, prevPath: this.props.locationPath }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true }
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.locationPath !== state.prevPath) {
      return {
        hasError: false,
        prevPath: props.locationPath,
      }
    }
    return null
  }

  componentDidCatch(error: Error): void {
    console.error('ErrorBoundary:', error)
  }

  handleReset = (): void => {
    this.setState({ hasError: false })
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-foreground">Algo deu errado</h1>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-[#005B2E] text-white rounded-lg font-bold hover:bg-[#01361D] transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  return <ErrorBoundaryClass locationPath={location.pathname}>{children}</ErrorBoundaryClass>
}
