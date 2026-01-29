import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Toaster } from 'react-hot-toast'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import SuperAdmin from './pages/SuperAdmin'
import AnalyticsPage from './pages/Analytics'
import Services from './pages/Services'
import BroadcastPost from './pages/BroadcastPost'
import Users from './pages/Users'
import NotFound from './pages/NotFound'
function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Services />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/broadcast" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <BroadcastPost />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Analytics />
    </Router>
  )
}

export default App
