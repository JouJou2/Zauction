import React, { useState } from 'react';
import axios from 'axios';
import './PhoneAuth.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const PhoneAuth = ({ onSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/api/auth/send-otp`, {
                phoneNumber
            });

            setMessage('OTP sent to your WhatsApp! Check your messages.');
            setStep('otp');

            // Show debug OTP in development
            if (response.data.debug?.otp) {
                console.log('🔐 Debug OTP:', response.data.debug.otp);
                setMessage(`OTP sent! (Dev mode: ${response.data.debug.otp})`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Make sure WhatsApp is connected.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
                phoneNumber,
                otp
            });

            setMessage('✅ Phone verified successfully!');

            // Call success callback
            if (onSuccess) {
                onSuccess(response.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep('phone');
        setOtp('');
        setError('');
        setMessage('');
    };

    return (
        <div className="phone-auth-container">
            <div className="phone-auth-card">
                <h2>📱 Phone Verification</h2>
                <p className="subtitle">Verify your phone number via WhatsApp</p>

                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                {step === 'phone' ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="1234567890 (with country code)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <small>Enter your phone number with country code (e.g., 1234567890)</small>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '⏳ Sending...' : '📨 Send OTP via WhatsApp'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="form-group">
                            <label htmlFor="otp">Verification Code</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="6"
                                required
                                disabled={loading}
                                autoFocus
                            />
                            <small>Check your WhatsApp for the verification code</small>
                        </div>

                        <div className="button-group">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? '⏳ Verifying...' : '✅ Verify Code'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
                                ← Back
                            </button>
                        </div>
                    </form>
                )}

                <div className="info-box">
                    <p>💡 <strong>Completely FREE!</strong></p>
                    <p>No SMS charges, no API costs. Uses open-source WhatsApp integration.</p>
                </div>
            </div>
        </div>
    );
};

export default PhoneAuth;
