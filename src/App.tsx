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
import SignUp from './features/client/SignUp';
import SignIn from './features/client/SignIn';
import ForgotPasswordPage from './features/client/ForgotPassword';
import ResetPassword from './features/client/ResetPassword';

// ─── Client 
import ClientLayout from './layouts/ClientLayout';
import UserHome from './features/client/UserHome';
import RequestCertificate from './features/client/certificates/Request';
import Progress from './features/client/certificates/Progress';
import Completed from './features/client/certificates/Completed';
import Pipeline from './features/client/certificates/Pipeline';
import UploadedDocuments from './features/client/UploadedDocuments';
import UserConversations from './features/client/conversations/List';
import UserChat from './features/client/conversations/Chat';
import UserNotifications from './features/client/Notifications';
import PendingPayments from './features/client/payment/PendingPayments';
import PaymentCheckout from './features/client/payment/PaymentCheckout';
import UserSettings from './features/client/Settings';
import UserProfile from './features/client/Profile';
import ChangePasswordUser from './features/client/ChangePassword';
import PaymentHistory from './features/client/payment/PaymentHistory';

// ─── Admin 
import Login from './features/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './features/admin/AdminHome';
import ConversationsList from './features/admin/conversations/List';
import AdminChat from './features/admin/conversations/Chat';
import CertificatesList from './features/admin/certificates/List';
import CertificateDetail from './features/admin/certificates/Detail';
import UsersList from './features/admin/users/List';
import UserDetail from './features/admin/users/Detail';
import AddAdmin from './features/admin/AddAdmin';
import AdminNotifications from './features/admin/Notifications';

import AdminSettings from './features/admin/Settings';
import ChangePasswordAdmin from './features/admin/ChangePassword';
import AdminProfile from './features/admin/Profile';
import TeamChat from './features/admin/conversations/TeamChat';
import Payments  from './features/admin/Payments';

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
