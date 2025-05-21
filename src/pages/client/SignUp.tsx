import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/SignUp.css';
import { registerClient, ContactName, RegisterFormData } from '../../services/authService';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<RegisterFormData>({
    businessName: '',
    businessType: '',
    industry: '',
    contactName: { firstName: '', lastName: '' },
    title: '',
    contactEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal && modalRef.current) {
      const bsModal = new Modal(modalRef.current);
      bsModal.show();
      const t = setTimeout(() => {
        bsModal.hide();
        navigate('/signin');
      }, 15000);
      return () => clearTimeout(t);
    }
  }, [showModal, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RegisterFormData] as ContactName),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName) newErrors.businessName = 'Business name is required';
    if (!formData.businessType) newErrors.businessType = 'Business type is required';
    if (!formData.industry) newErrors.industry = 'Industry is required';
    if (!formData.contactName.firstName) newErrors['contactName.firstName'] = 'First name is required';
    if (!formData.contactName.lastName)  newErrors['contactName.lastName']  = 'Last name is required';
    if (!formData.title)                  newErrors.title                 = 'Title/Position is required';

    if (!formData.contactEmail) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email is invalid';
    }
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and numbers';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await registerClient(formData);
      setFormData({
        businessName: '',
        businessType: '',
        industry: '',
        contactName: { firstName: '', lastName: '' },
        title: '',
        contactEmail: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      });
      setShowModal(true);
    } catch (err: any) {
      setErrors({ form: err.message || 'Something went wrong, please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-10 col-xl-11 col-lg-12">
            <div className="card signup-card overflow-hidden shadow-lg border-0">
              <div className="row g-0">
                <div className="col-lg-5 bg-primary text-white p-4 p-lg-5 d-flex flex-column">
                  <div className="brand-container mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="logo-circle me-2">
                        <i className="bi bi-shield-check fs-4"></i>
                      </div>
                      <h1 className="brand-name fs-3 fw-bold mb-0">CertiSphere</h1>
                    </div>
                  </div>
                  <div className="hero-content mt-4">
                    <h2 className="fw-bold fs-1 mb-3">Your Certification Partner</h2>
                    <p className="fs-5 mb-4 text-white-50">
                      Manage your business certifications efficiently with our secure platform. Upload documents, request different types of Certificates, track progress, and download your certificates all in one place.
                    </p>
                    <div className="benefits-container mt-auto">
                      <div className="benefit-item d-flex align-items-start mb-4">
                        <div className="benefit-icon me-3 bg-white-10 rounded-3 p-2 text-center">
                          <i className="bi bi-upload fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Document Upload</h4>
                          <p className="text-white-50">Securely upload and store your files</p>
                        </div>
                      </div>
                      <div className="benefit-item d-flex align-items-start mb-4">
                        <div className="benefit-icon me-3 bg-white-10 rounded-3 p-2 text-center">
                          <i className="bi bi-search fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Real-time Tracking</h4>
                          <p className="text-white-50">Monitor certification progress at every stage</p>
                        </div>
                      </div>
                      <div className="benefit-item d-flex align-items-start mb-4">
                        <div className="benefit-icon me-3 bg-white-10 rounded-3 p-2 text-center">
                          <i className="bi bi-credit-card fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Secure Payments</h4>
                          <p className="text-white-50">Pay for certificates using encrypted transactions</p>
                        </div>
                      </div>
                      <div className="benefit-item d-flex align-items-start">
                        <div className="benefit-icon me-3 bg-white-10 rounded-3 p-2 text-center">
                          <i className="bi bi-file-earmark-check fs-5"></i>
                        </div>
                        <div className="benefit-info">
                          <h4 className="fw-bold fs-5">Digital Certificates</h4>
                          <p className="text-white-50">Download your verified certificates instantly</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="decoration-circles position-absolute">
                    <div className="circle circle-1"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-3"></div>
                  </div>
                </div>
                <div className="col-lg-7 bg-white p-4 p-lg-5">
                  <div className="form-wrapper">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold text-certisphere-blue">Create Your CertiSphere Account</h2>
                      <p className="text-muted">Fill out the form below to access our certification management platform</p>
                    </div>
                    {errors.form && <div className="alert alert-danger mb-4">{errors.form}</div>}
                    <form onSubmit={handleSubmit} className="signup-form">
                      <div className="form-section bg-light p-4 rounded mb-4 position-relative">
                        <h3 className="section-title">
                          <i className="bi bi-building me-2 text-primary"></i>Business Details
                        </h3>
                        <div className="mb-3">
                          <label htmlFor="businessName" className="form-label">Business Name*</label>
                          <input
                            id="businessName"
                            name="businessName"
                            type="text"
                            className={`form-control ${errors.businessName ? 'is-invalid' : ''}`}
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Enter your business name"
                          />
                          {errors.businessName && <div className="invalid-feedback">{errors.businessName}</div>}
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="businessType" className="form-label">Business Type*</label>
                            <select
                              id="businessType"
                              name="businessType"
                              className={`form-select ${errors.businessType ? 'is-invalid' : ''}`}
                              value={formData.businessType}
                              onChange={handleChange}
                            >
                              <option value="">Select business type</option>
                              <option value="llc">LLC</option>
                              <option value="corporation">Corporation</option>
                              <option value="partnership">Partnership</option>
                              <option value="soleProprietorship">Sole Proprietorship</option>
                              <option value="nonprofit">Non-profit</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.businessType && <div className="invalid-feedback">{errors.businessType}</div>}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="industry" className="form-label">Industry*</label>
                            <select
                              id="industry"
                              name="industry"
                              className={`form-select ${errors.industry ? 'is-invalid' : ''}`}
                              value={formData.industry}
                              onChange={handleChange}
                            >
                              <option value="">Select industry</option>
                              <option value="technology">Information Technology</option>
                              <option value="manufacturing">Manufacturing</option>
                              <option value="healthcare">Healthcare</option>
                              <option value="retail">Retail</option>
                              <option value="finance">Finance & Banking</option>
                              <option value="construction">Construction</option>
                              <option value="education">Education</option>
                              <option value="Civil & Geotechnical Engineering">Civil & Geotechnical Engineering</option>
                              <option value="food">Food & Hospitality</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.industry && <div className="invalid-feedback">{errors.industry}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="form-section bg-light p-4 rounded mb-4 position-relative">
                        <h3 className="section-title">
                          <i className="bi bi-person me-2 text-primary"></i>Contact Information
                        </h3>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="firstName" className="form-label">First Name*</label>
                            <input
                              id="firstName"
                              name="contactName.firstName"
                              type="text"
                              className={`form-control ${errors['contactName.firstName'] ? 'is-invalid' : ''}`}
                              value={formData.contactName.firstName}
                              onChange={handleChange}
                              placeholder="First Name"
                            />
                            {errors['contactName.firstName'] && <div className="invalid-feedback">{errors['contactName.firstName']}</div>}
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="lastName" className="form-label">Last Name*</label>
                            <input
                              id="lastName"
                              name="contactName.lastName"
                              type="text"
                              className={`form-control ${errors['contactName.lastName'] ? 'is-invalid' : ''}`}
                              value={formData.contactName.lastName}
                              onChange={handleChange}
                              placeholder="Last Name"
                            />
                            {errors['contactName.lastName'] && <div className="invalid-feedback">{errors['contactName.lastName']}</div>}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="title" className="form-label">Title/Position*</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-tag"></i></span>
                            <input
                              id="title"
                              name="title"
                              type="text"
                              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                              value={formData.title}
                              onChange={handleChange}
                              placeholder="e.g., CEO, Manager"
                            />
                            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="contactEmail" className="form-label">Email Address*</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                            <input
                              id="contactEmail"
                              name="contactEmail"
                              type="email"
                              className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                              value={formData.contactEmail}
                              onChange={handleChange}
                              placeholder="email@company.com"
                            />
                            {errors.contactEmail && <div className="invalid-feedback">{errors.contactEmail}</div>}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="phoneNumber" className="form-label">Phone Number*</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-telephone"></i></span>
                            <input
                              id="phoneNumber"
                              name="phoneNumber"
                              type="tel"
                              className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="(000) 000-0000"
                            />
                            {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="form-section bg-light p-4 rounded mb-4 position-relative">
                        <h3 className="section-title">
                          <i className="bi bi-lock me-2 text-primary"></i>Security
                        </h3>
                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">Create Password*</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-key"></i></span>
                            <input
                              id="password"
                              name="password"
                              type="password"
                              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="Create a secure password"
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                          </div>
                          <small className="form-text text-muted">
                            Password must be at least 8 characters long with uppercase, lowercase, and numbers
                          </small>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">Confirm Password*</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-key-fill"></i></span>
                            <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              placeholder="Confirm your password"
                            />
                            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="terms-container mb-4 text-center small text-muted">
                        <p>
                          By clicking "Create Account", you agree to our <a href="#">Terms of Service</a>, <a href="#">Privacy Policy</a>, and consent to the processing of your business information for certification purposes.
                        </p>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 mb-4 signup-button"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating Account...
                          </>
                        ) : (
                          'Create CertiSphere Account'
                        )}
                      </button>
                      <div className="text-center">
                        <div className="mb-3">
                          Already have an account? <Link to="/signin" className="text-decoration-none fw-semibold">Sign In</Link>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
     
      <div
        className="modal fade"
        ref={modalRef}
        tabIndex={-1}
        aria-labelledby="successModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center">
            <div className="modal-header bg-success text-white">
              <h5 className="modal-title w-100" id="successModalLabel">Account Created!</h5>
            </div>
            <div className="modal-body p-4">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
              <p className="mb-2">We've sent you an email with your unique client code.</p>
              <p>You’ll be redirected to the sign in page shortly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
