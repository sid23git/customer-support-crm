import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';

function CreateTicket() {
  const { addTicket } = useTickets();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error message when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Clear validation errors
    const newErrors = {
      customer_name: '',
      customer_email: '',
      subject: '',
      description: ''
    };
    
    const { customer_name, customer_email, subject, description } = formData;
    let isValid = true;

    if (!customer_name.trim()) {
      newErrors.customer_name = 'Customer name is required.';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer_email.trim()) {
      newErrors.customer_email = 'Email address is required.';
      isValid = false;
    } else if (!emailRegex.test(customer_email.trim())) {
      newErrors.customer_email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required.';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required.';
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    setSubmitting(true);
    try {
      await addTicket({
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        subject: subject.trim(),
        description: description.trim()
      });
      
      // Form fields should clear after successful submission.
      setFormData({
        customer_name: '',
        customer_email: '',
        subject: '',
        description: ''
      });
      
      // Redirect to home page.
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while creating the ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div>
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-800 transition-colors font-medium border-0 bg-transparent p-0 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to tickets
        </button>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-4 m-0">Create New Ticket</h1>
        <p className="text-xs text-neutral-400 font-medium mt-1">Submit support requests on behalf of customers.</p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} noValidate className="bg-white border border-neutral-200/80 rounded-lg p-6 space-y-5 shadow-sm">
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200/60 rounded-md text-xs font-semibold text-red-800">
            {errorMsg}
          </div>
        )}

        {/* Customer Identity Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="customer_name" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Customer Name
            </label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              placeholder="e.g. Sarah Jenkins"
              value={formData.customer_name}
              onChange={handleChange}
              disabled={submitting}
              className={`w-full px-3.5 py-2 text-xs font-medium bg-white border rounded-md placeholder-neutral-350 focus:outline-none focus:ring-1 transition-colors disabled:bg-neutral-50 ${
                errors.customer_name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400'
              }`}
            />
            {errors.customer_name && (
              <p className="text-[11px] font-semibold text-red-650 mt-1">{errors.customer_name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="customer_email" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Customer Email
            </label>
            <input
              type="email"
              id="customer_email"
              name="customer_email"
              placeholder="e.g. sarah@acme.com"
              value={formData.customer_email}
              onChange={handleChange}
              disabled={submitting}
              className={`w-full px-3.5 py-2 text-xs font-medium bg-white border rounded-md placeholder-neutral-350 focus:outline-none focus:ring-1 transition-colors disabled:bg-neutral-50 ${
                errors.customer_email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400'
              }`}
            />
            {errors.customer_email && (
              <p className="text-[11px] font-semibold text-red-650 mt-1">{errors.customer_email}</p>
            )}
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-1.5">
          <label htmlFor="subject" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            placeholder="Brief summary of the issue"
            value={formData.subject}
            onChange={handleChange}
            disabled={submitting}
            className={`w-full px-3.5 py-2 text-xs font-medium bg-white border rounded-md placeholder-neutral-350 focus:outline-none focus:ring-1 transition-colors disabled:bg-neutral-50 ${
              errors.subject 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400'
            }`}
          />
          {errors.subject && (
            <p className="text-[11px] font-semibold text-red-650 mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            placeholder="Detailed overview of the customer request, including steps to reproduce or billing discrepancies..."
            value={formData.description}
            onChange={handleChange}
            disabled={submitting}
            className={`w-full px-3.5 py-2 text-xs font-medium bg-white border rounded-md placeholder-neutral-350 focus:outline-none focus:ring-1 transition-colors disabled:bg-neutral-50 resize-y min-h-[100px] ${
              errors.description 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400'
            }`}
          />
          {errors.description && (
            <p className="text-[11px] font-semibold text-red-650 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-transparent hover:bg-neutral-50 rounded-md border border-neutral-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:bg-neutral-400 cursor-pointer shadow-sm min-w-[100px]"
          >
            {submitting ? (
              <div className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;
