
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FiUserPlus, FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/AddAdmin.css';

import { AdminFormData, registerNewAdmin } from '../../services/adminService';

interface DecodedToken {
  role: string;
  userId: number;
  exp: number;
}

const AddAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);


  const [formData, setFormData] = useState<AdminFormData>({
    firstName: '',
    lastName: '',
    title: '',
    contactEmail: '',
    phoneNumber: ''
  });

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const serverUrl = 'http://13.48.42.53:5000';

  
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      navigate('/admin-login');
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(storedToken);
      if (decoded.role !== 'admin') {
        navigate('/admin-login');
      } else {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/admin-login');
    }
  }, [navigate]);

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const validateForm = (): boolean => {
    
    const requiredFields = ['firstName', 'lastName', 'title', 'contactEmail', 'phoneNumber'] as const;

    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage('Please fill in all required fields');
        return false;
      }
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }

    
    const phoneRegex = /^\+?[\d\s()-]{10,}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setErrorMessage('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm() || !token) {
      return;
    }

    setIsSubmitting(true);

    try {
      const adminCode = await registerNewAdmin(formData, token, serverUrl);

      setSuccessMessage(`Admin successfully registered! Admin Code: ${adminCode}`);
      setFormData({
        firstName: '',
        lastName: '',
        title: '',
        contactEmail: '',
        phoneNumber: ''
      });
    } catch (error: any) {
      console.error('Error registering admin:', error);
      setErrorMessage(error.message || 'Failed to register admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-page bg-light">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <button
              className="btn btn-outline-secondary mb-4 d-flex align-items-center"
              onClick={() => navigate('/admin')}
            >
              <FiArrowLeft className="me-2" /> Back to Dashboard
            </button>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center mb-2">
                  <FiUserPlus className="text-primary me-3" size={24} />
                  <h1 className="h3 mb-0">Add New Administrator</h1>
                </div>
                <p className="text-muted mb-4">Create a new administrator account. They will receive their admin code and a password setup link via email.</p>

                
                {successMessage && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <FiCheckCircle className="me-2" />
                    <div>{successMessage}</div>
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FiAlertCircle className="me-2" />
                    <div>{errorMessage}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="bg-white rounded p-4 mb-4 border">
                    <h3 className="h5 mb-4 pb-2 border-bottom">Personal Details</h3>
                    
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="firstName" className="form-label">First Name *</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className="form-control"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First name"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="lastName" className="form-label">Last Name *</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className="form-control"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="title" className="form-label">Job Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Project Manager"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="contactEmail" className="form-label">Email Address *</label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        className="form-control"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="someone@example.com"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="form-control"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div className="d-flex flex-column flex-sm-row justify-content-end gap-3 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/admin')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Admin...
                        </>
                      ) : 'Create Administrator'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;
