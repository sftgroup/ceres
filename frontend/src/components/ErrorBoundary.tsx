import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Graph</h3>
            <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4 overflow-hidden">
              <div className="text-center py-20 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm">Unable to render network graph</p>
                <p className="text-xs text-gray-600 mt-1">Graph visualization is currently unavailable</p>
              </div>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
