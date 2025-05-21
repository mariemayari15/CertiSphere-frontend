import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';        
import 'bootstrap-icons/font/bootstrap-icons.css';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import ProtectedRoute from './layouts/ProtectedRoute';

const { Content } = Layout;

// ─── Public Pages 
import SignUp from './pages/client/SignUp';
import SignIn from './pages/client/SignIn';
import ForgotPasswordPage from './pages/client/ForgotPassword';
import ResetPassword from './pages/client/ResetPassword';

// ─── Client 
import ClientLayout from './layouts/ClientLayout';
import UserHome from './pages/client/UserHome';
import RequestCertificate from './pages/client/certificates/Request';
import Progress from './pages/client/certificates/Progress';
import Completed from './pages/client/certificates/Completed';
import Pipeline from './pages/client/certificates/Pipeline';
import UploadedDocuments from './pages/client/UploadedDocuments';
import UserConversations from './pages/client/conversations/List';
import UserChat from './pages/client/conversations/Chat';
import UserNotifications from './pages/client/Notifications';
import PendingPayments from './pages/client/payment/PendingPayments';
import PaymentCheckout from './pages/client/payment/PaymentCheckout';
import UserSettings from './pages/client/Settings';
import UserProfile from './pages/client/Profile';
import ChangePasswordUser from './pages/client/ChangePassword';
import PaymentHistory from './pages/client/payment/PaymentHistory';

// ─── Admin 
import Login from './pages/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import ConversationsList from './pages/admin/conversations/List';
import AdminChat from './pages/admin/conversations/Chat';
import CertificatesList from './pages/admin/certificates/List';
import CertificateDetail from './pages/admin/certificates/Detail';
import UsersList from './pages/admin/users/List';
import UserDetail from './pages/admin/users/Detail';
import AddAdmin from './pages/admin/AddAdmin';
import AdminNotifications from './pages/admin/Notifications';

import AdminSettings from './pages/admin/Settings';
import ChangePasswordAdmin from './pages/admin/ChangePassword';
import AdminProfile from './pages/admin/Profile';
import TeamChat from './pages/admin/conversations/TeamChat';
import Payments  from './pages/admin/Payments';

const stripePromise = loadStripe(
  'pk_test_51R3TTo2fYdZSuWCEGOtdbGGd3bWcVf5UmSR9bHicOzui3lPQyhWuh0ISg8KgJlpOOelArbqndlOdS47695g11f6d00BJBdzkI1'
);

const App: React.FC = () => (
  <Elements stripe={stripePromise}>
    <Router>
      <Layout className="app-layout">
        <Content className="app-content">
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<SignUp />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* CLIENT PROTECTED ROUTES */}
            <Route
              element={
                <ProtectedRoute
                  redirectPath="/signin"
                  requiredRole="client"
                />
              }
            >
              <Route path="/user" element={<ClientLayout />}>
                <Route index element={<UserHome />} />
                <Route path="dashboard" element={<UserHome />} />
                <Route path="new-certificate" element={<RequestCertificate />} />
                <Route path="documents" element={<UploadedDocuments />} />
                <Route path="progress" element={<Progress />} />
                <Route path="completed" element={<Completed />} />
                <Route path="payments" element={<PendingPayments />} />
                <Route path="payment_checkout/:certificateId" element={<PaymentCheckout />} />
                <Route path="support" element={<UserConversations />} />
                <Route path="chat/:conversationId" element={<UserChat />} />
                <Route path="notifications" element={<UserNotifications />} />
                <Route path="certificate/:id" element={<Pipeline />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="change-password" element={<ChangePasswordUser />} />
                <Route path="payment-history" element={<PaymentHistory />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            
            <Route path="/certificate/:id" element={<Navigate to="/user/certificate/:id" replace />} />
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/generate_certificate" element={<Navigate to="/user/new-certificate" replace />} />
            <Route path="/track-progress" element={<Navigate to="/user/progress" replace />} />
            <Route path="/user_documents" element={<Navigate to="/user/documents" replace />} />
            <Route path="/pending-payments" element={<Navigate to="/user/payments" replace />} />
            <Route path="/conversations" element={<Navigate to="/user/support" replace />} />
            <Route path="/chat/:conversationId" element={<Navigate to="/user/chat/:conversationId" replace />} />
            <Route path="/notifications" element={<Navigate to="/user/notifications" replace />} />
            <Route path="/change-password" element={<Navigate to="/user/change-password" replace />} />

            {/* ADMIN LOGIN */}
            <Route path="/admin-login" element={<Login />} />

            {/* ADMIN PROTECTED ROUTES */}
            <Route
              element={
                <ProtectedRoute
                  redirectPath="/admin-login"
                  requiredRole="admin"
                />
              }
            >
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="dashboard" element={<AdminHome />} />
                <Route path="certifications" element={<CertificatesList />} />
                <Route path="certifications/:certificateId" element={<CertificateDetail />} />
                <Route path="conversations" element={<ConversationsList />} />
                <Route path="chat/:conversationId" element={<AdminChat />} />
                <Route path="users" element={<UsersList />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="add-admin" element={<AddAdmin />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="team-chat" element={<TeamChat />} />
                <Route path="change-password" element={<ChangePasswordAdmin />} />
                <Route path="payments" element={<Payments />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  </Elements>
);

export default App;
