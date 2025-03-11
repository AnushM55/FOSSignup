import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import "./MultiStepForm.css"; // Your custom CSS will override Bootstrap when needed

export default function MultiStepForm() {
  const [formData, setFormData] = useState({});
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [eventName, setEventName] = useState("Event Registration");
  const [adminCredentials, setAdminCredentials] = useState({ username: "", password: "" });
  const [adminList, setAdminList] = useState([]);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const navigate = useNavigate();
  
  // Fetch admin CSV and form fields on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch admin list
        const adminResponse = await axios.get("http://localhost:5000/admins");
        setAdminList(adminResponse.data);
        
        // Fetch form fields configuration
        const fieldsResponse = await axios.get("http://localhost:5000/form-fields");
        setFormFields(fieldsResponse.data);


        const eventNameResponse = await axios.get("http://localhost:5000/event-name");
        setEventName(eventNameResponse.data.eventName || "Event Registration");
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Fallback to default fields if the API fails
        setFormFields([
          { label: "Enter your Name", key: "name", type: "text" },
          { label: "Enter your Email", key: "email", type: "email" },
          { label: "Enter your Phone", key: "phone", type: "tel" },
        ]);
      }
    };
    
    fetchInitialData();
  }, []);



  // Inside the MultiStepForm component, add a handlePrevious function
const handlePrevious = () => {
  if (step > 0) {
    setStep((prev) => prev - 1);
  }
};


  const handleNext = async (e) => {
    e.preventDefault();
    const inputValue = e.target.elements.input.value.trim();
    if (!inputValue) return;

    // Create a new form data object with the current field's value
    const updatedFormData = {
      ...formData,
      [formFields[step].key]: inputValue
    };
    
    // Update the state
    setFormData(updatedFormData);

    if (step < formFields.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      // Pass the updated data directly to handleSubmit
      // instead of waiting for state update
      handleSubmit(updatedFormData);
    }
  };

  const handleSubmit = async (finalFormData) => {
    setSubmitted(true);
    try {
      // Use the finalFormData parameter instead of the state
      const dataToSubmit = finalFormData || formData;
      
      console.log("Submitting form data:", dataToSubmit);
      await axios.post("http://localhost:5000/upload", dataToSubmit);
      alert("Form Submitted & Saved to Google Drive!");
    } catch (error) {
      alert("Error uploading to Google Drive!");
      console.error(error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    console.debug('Admin login attempt initiated');
    console.debug(`Login attempt for username: ${adminCredentials.username}`);
    
    setIsLoading(true);
    setLoginError("");
  
    try {
      console.debug('Fetching admin credentials from server');
      // Fetch admin credentials from server
      const response = await fetch('http://localhost:5000/admins');
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const adminData = await response.json();
      console.debug('Received admin credentials from server');
  
      // Check if credentials match
      const isValid = 
        adminCredentials.username === adminData.username && 
        adminCredentials.password === adminData.password;
  
      console.debug('Admin authentication result:', isValid ? 'Success' : 'Failed');
  
      if (isValid) {
        console.debug(`Successfully authenticated admin: ${adminData.username}`);
        // Set admin session/token/etc
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminName", adminData.username);
        
        // Navigate to admin dashboard
        console.debug('Redirecting to admin dashboard');
        navigate("/admin-dashboard");
      } else {
        console.debug('Authentication failed: Invalid credentials');
        setLoginError("Invalid username or password");
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      console.debug('Error type:', error.name);
      console.debug('Error message:', error.message);
      console.debug('Is network error:', error instanceof TypeError);
    
      setLoginError("Login service unavailable");
    } finally {
      console.debug('Admin login process completed');
      setIsLoading(false);
    }
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // If form fields are not yet loaded, show loading state
  if (formFields.length === 0) {
    return (
      <div className="loading-container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
        <div className="loading-content text-center">
          <div className="spinner mb-3"></div>
          <p>Initializing registration form...</p>
        </div>
      </div>
    );
  }
  
  return (

    
    <div className="form-container">

      
      {/* Top navigation bar */}
      {/* Top navigation bar */}
<div className="nav-bar d-flex justify-content-between align-items-center">
  <div className="logo-container d-flex align-items-center">
    {/* Add your logo image here */}
    <img 
      src="/LOGO_FOSS-CIT.png" 
      alt="FOSS Club Logo" 
      className="me-2 logo-image" 
    />
    
    <h1><span className="accent">FOSS Club of CIT</span> {eventName} Registration form</h1>
  </div>
  <button
    onClick={() => setShowAdminLogin(!showAdminLogin)}
    className="admin-button btn"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="admin-icon me-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Admin Access
  </button>
</div>

      {/* Terminal-style background elements */}
      <div className="background-elements">
        <div className="terminal-text left-text">
          $ git clone https://github.com/foss-club/register<br />
          $ cd register<br />
          $ npm install<br />
          $ npm start<br />
          <br />
          > Starting development server...<br />
          > FOSS Club registration server running on port 3000<br />
          > Ready for new contributors!<br />
        </div>
        <div className="terminal-text right-text">
          &lt;div className="open-source"&gt;<br />
          &nbsp;&nbsp;&lt;h1&gt;Freedom to Create&lt;/h1&gt;<br />
          &nbsp;&nbsp;&lt;h1&gt;Freedom to Share&lt;/h1&gt;<br />
          &nbsp;&nbsp;&lt;h1&gt;Freedom to Learn&lt;/h1&gt;<br />
          &lt;/div&gt;
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="admin-modal"
          >
            <div className="modal-header">
              <h2>Admin Terminal</h2>
              <div className="window-buttons">
                <div className="window-button red"></div>
                <div className="window-button yellow"></div>
                <div className="window-button green"></div>
              </div>
            </div>
            {loginError && (
              <div className="login-error alert alert-danger">
                Error: {loginError}
              </div>
            )}
            <form onSubmit={handleAdminLogin}>
              <div className="form-group mb-3">
                <label>username:</label>
                <input
                  type="text"
                  name="username"
                  className="form-control custom-input"
                  value={adminCredentials.username}
                  onChange={handleAdminInputChange}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label>password:</label>
                <input
                  type="password"
                  name="password"
                  className="form-control custom-input"
                  value={adminCredentials.password}
                  onChange={handleAdminInputChange}
                  required
                />
              </div>
              <div className="modal-buttons d-flex justify-content-between">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="cancel-button btn"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="login-button btn"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      authenticating...
                    </>
                  ) : (
                    'sudo login'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Registration Form */}
      <div className="form-wrapper container">
        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-container card"
          >
            <div className="success-icon mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="my-3">Registration Successful!</h2>
            <p>Welcome to the FOSS community!</p>
            <div className="terminal-output">
              $ git commit -m "Added new contributor to the community"<br />
              $ git push origin main<br />
              <span className="success-text">[Success] New member registered!</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="form-card card"
          >
            {/* Progress bar - Using Bootstrap progress */}
            <div className="progress" style={{ height: "4px", borderRadius: "0" }}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar"
                style={{ 
                  width: `${((step + 1) / formFields.length) * 100}%`,
                  background: "linear-gradient(90deg, #ffd700, #ffaa00)"
                }}
                aria-valuenow={((step + 1) / formFields.length) * 100}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            
            <div className="form-content card-body">
              <div className="step-header d-flex align-items-center mb-4">
                <div className="step-number d-flex align-items-center justify-content-center me-3">
                  {step + 1}
                </div>
                <h2 className="mb-0">
                  {formFields[step].label}
                </h2>
              </div>
              
              <form onSubmit={handleNext}>
              <div className="input-container position-relative mb-4">
  <span className="input-prefix">$</span>
  <input
    type={formFields[step].type}
    name="input"
    className="form-control custom-input"
    autoFocus
    defaultValue={formData[formFields[step].key] || ""}
    placeholder={`Enter your ${formFields[step].key}...`}
  />
</div>
                
                <div className="form-footer d-flex justify-content-between align-items-center">
  <div className="d-flex align-items-center">
    {step > 0 && (
      <button
        type="button"
        onClick={handlePrevious}
        className="prev-button btn me-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="button-icon me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
    )}
    <div className="step-indicator small text-muted">
      Step {step + 1} of {formFields.length}
    </div>
  </div>
  <button
    type="submit"
    className="next-button btn"
  >
    {step < formFields.length - 1 ? (
      <>
        Next
        <svg xmlns="http://www.w3.org/2000/svg" className="button-icon ms-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </>
    ) : (
      <>
        Submit
        <svg xmlns="http://www.w3.org/2000/svg" className="button-icon ms-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </>
    )}
  </button>
</div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Footer */}
      <div className="footer mt-auto py-2">
  <p className="text-center mb-0 small">Together, we build the future of open source |© FOSS-CIT 2024-25 | Developed by: Lithika Rajkumar</p>
</div>
    </div>
  );
}
