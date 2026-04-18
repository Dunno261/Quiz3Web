import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function LoanApplication({ showToast }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    applicant: '',
    cnic: '',
    contact: '',
    amount: '',
    purpose: 'Business',
    tenure: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loanId, setLoanId] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateStepOne() {
    const nextErrors = {};
    if (!formData.applicant.trim()) {
      nextErrors.applicant = 'Applicant is required';
    }
    if (!formData.cnic.trim()) {
      nextErrors.cnic = 'CNIC is required';
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      nextErrors.cnic = 'CNIC format must be 12345-1234567-1';
    }
    if (!formData.contact.trim()) {
      nextErrors.contact = 'Contact is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateStepTwo() {
    const nextErrors = {};
    const amount = Number(formData.amount);
    const tenure = Number(formData.tenure);

    if (!formData.amount) {
      nextErrors.amount = 'Amount is required';
    } else if (amount < 5000 || amount > 5000000) {
      nextErrors.amount = 'Amount must be between 5000 and 5000000';
    }

    if (!formData.tenure) {
      nextErrors.tenure = 'Tenure is required';
    } else if (tenure < 3 || tenure > 60) {
      nextErrors.tenure = 'Tenure must be between 3 and 60 months';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (step === 1 && !validateStepOne()) {
      return;
    }
    if (step === 2 && !validateStepTwo()) {
      return;
    }
    setErrors({});
    setStep((prev) => prev + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((prev) => prev - 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/loans/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant: formData.applicant,
          amount: Number(formData.amount),
          purpose: formData.purpose,
          tenure: Number(formData.tenure)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply for loan');
      }

      setSubmitted(true);
      setLoanId(data.id);
    } catch (err) {
      showToast(err.message || err, 'error');
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: '1rem' }}>
        <h1>Loan Application Submitted</h1>
        <p>Loan ID: {loanId}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Loan Application</h1>

      <div style={{ width: '100%', background: '#e5e7eb', height: '10px', borderRadius: '6px', marginBottom: '1rem' }}>
        <div className="progress-fill" style={{ width: (step / 3 * 100) + '%', height: '100%', background: '#16a34a', borderRadius: '6px' }} />
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                name="applicant"
                value={formData.applicant}
                onChange={handleChange}
                placeholder="Applicant Name"
              />
              {errors.applicant && <small style={{ color: '#dc2626', display: 'block' }}>{errors.applicant}</small>}
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <input
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="CNIC (12345-1234567-1)"
              />
              {errors.cnic && <small style={{ color: '#dc2626', display: 'block' }}>{errors.cnic}</small>}
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <input
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Contact"
              />
              {errors.contact && <small style={{ color: '#dc2626', display: 'block' }}>{errors.contact}</small>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Amount"
              />
              {errors.amount && <small style={{ color: '#dc2626', display: 'block' }}>{errors.amount}</small>}
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <select name="purpose" value={formData.purpose} onChange={handleChange}>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="number"
                name="tenure"
                value={formData.tenure}
                onChange={handleChange}
                placeholder="Tenure in months"
              />
              {errors.tenure && <small style={{ color: '#dc2626', display: 'block' }}>{errors.tenure}</small>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Applicant:</strong> {formData.applicant}</p>
            <p><strong>CNIC:</strong> {formData.cnic}</p>
            <p><strong>Contact:</strong> {formData.contact}</p>
            <p><strong>Amount:</strong> {formData.amount}</p>
            <p><strong>Purpose:</strong> {formData.purpose}</p>
            <p><strong>Tenure:</strong> {formData.tenure}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {step > 1 && (
            <button type="button" onClick={handleBack}>
              Back
            </button>
          )}
          {step < 3 && (
            <button type="button" onClick={handleNext}>
              Next
            </button>
          )}
          {step === 3 && <button type="submit">Submit Application</button>}
        </div>
      </form>
    </div>
  );
}

export default LoanApplication;
