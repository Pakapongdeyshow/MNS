import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl space-y-4 text-center">
            <div className="text-4xl mb-2">🌱</div>
            <h2 className="text-xl font-bold text-slate-900">เกิดข้อผิดพลาดในการแสดงผล</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {this.state.error?.message || 'ระบบพบข้อผิดพลาดที่ไม่คาดคิด'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-5 py-2.5 bg-nature-600 hover:bg-nature-700 text-white text-xs font-bold rounded-2xl shadow-md transition"
              >
                ล้างข้อมูลและโหลดใหม่ 🔄
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
