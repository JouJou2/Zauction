import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuctionNotifier.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const AuctionNotifier = () => {
    const [whatsappStatus, setWhatsappStatus] = useState({ isConnected: false, hasQRCode: false });
    const [qrCode, setQrCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);

    const [auctionData, setAuctionData] = useState({
        auctionId: '',
        title: '',
        startingPrice: '',
        startTime: '',
        location: 'Online',
        url: ''
    });

    // Check WhatsApp connection status
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/whatsapp/status`);
            setWhatsappStatus(response.data);

            if (response.data.hasQRCode && !response.data.isConnected) {
                fetchQRCode();
            } else if (response.data.isConnected) {
                setQrCode(null);
                fetchUsers();
            }
        } catch (err) {
            console.error('Status check failed:', err);
        }
    };

    const fetchQRCode = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/whatsapp/qr`);
            if (response.data.qrCode) {
                setQrCode(response.data.qrCode);
            }
        } catch (err) {
            console.error('Failed to fetch QR code:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/users`);
            setUsers(response.data.users || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleInputChange = (e) => {
        setAuctionData({
            ...auctionData,
            [e.target.name]: e.target.value
        });
    };

    const handleSendNotifications = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(`${API_URL}/api/auctions/notify`, auctionData);

            setMessage(`✅ ${response.data.message}`);

            // Reset form
            setAuctionData({
                auctionId: '',
                title: '',
                startingPrice: '',
                startTime: '',
                location: 'Online',
                url: ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send notifications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auction-notifier-container">
            <div className="auction-notifier-card">
                <h1>🔔 Auction Notification System</h1>
                <p className="subtitle">Send WhatsApp notifications to all users - Completely FREE!</p>

                {/* WhatsApp Connection Status */}
                <div className={`status-banner ${whatsappStatus.isConnected ? 'connected' : 'disconnected'}`}>
                    {whatsappStatus.isConnected ? (
                        <>
                            <span className="status-icon">✅</span>
                            <span>WhatsApp Connected | {users.length} users subscribed</span>
                        </>
                    ) : (
                        <>
                            <span className="status-icon">⚠️</span>
                            <span>WhatsApp Not Connected - Scan QR Code Below</span>
                        </>
                    )}
                </div>

                {/* QR Code Display */}
                {qrCode && !whatsappStatus.isConnected && (
                    <div className="qr-code-section">
                        <h3>📱 Scan QR Code with WhatsApp</h3>
                        <p>Open WhatsApp → Settings → Linked Devices → Link a Device</p>
                        <img src={qrCode} alt="WhatsApp QR Code" className="qr-code-image" />
                        <p className="qr-note">QR Code refreshes automatically</p>
                    </div>
                )}

                {/* Notification Form */}
                {whatsappStatus.isConnected && (
                    <>
                        {error && <div className="alert alert-error">{error}</div>}
                        {message && <div className="alert alert-success">{message}</div>}

                        <form onSubmit={handleSendNotifications} className="notification-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="auctionId">Auction ID</label>
                                    <input
                                        type="number"
                                        id="auctionId"
                                        name="auctionId"
                                        value={auctionData.auctionId}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="startingPrice">Starting Price ($)</label>
                                    <input
                                        type="number"
                                        id="startingPrice"
                                        name="startingPrice"
                                        value={auctionData.startingPrice}
                                        onChange={handleInputChange}
                                        placeholder="5000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">Auction Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={auctionData.title}
                                    onChange={handleInputChange}
                                    placeholder="Vintage Car Collection"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startTime">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        id="startTime"
                                        name="startTime"
                                        value={auctionData.startTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={auctionData.location}
                                        onChange={handleInputChange}
                                        placeholder="Online"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="url">Auction URL</label>
                                <input
                                    type="url"
                                    id="url"
                                    name="url"
                                    value={auctionData.url}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/auction/123"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? '⏳ Sending to ' + users.length + ' users...' : `📨 Send to ${users.length} Users`}
                            </button>
                        </form>

                        {/* Preview */}
                        {auctionData.title && (
                            <div className="preview-section">
                                <h3>📱 Message Preview</h3>
                                <div className="whatsapp-preview">
                                    <div className="preview-header">WhatsApp</div>
                                    <div className="preview-message">
                                        <strong>🔔 New Auction Alert!</strong>
                                        <br /><br />
                                        <strong>📦 {auctionData.title || '[Title]'}</strong>
                                        <br /><br />
                                        💰 Starting Price: ${auctionData.startingPrice || '[Price]'}
                                        <br />
                                        ⏰ Starts: {auctionData.startTime || '[Time]'}
                                        <br />
                                        📍 Location: {auctionData.location || 'Online'}
                                        <br /><br />
                                        🔗 Bid now: {auctionData.url || '[URL]'}
                                        <br /><br />
                                        <em>Good luck! 🍀</em>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Info Box */}
                <div className="info-box">
                    <p>💡 <strong>100% FREE Solution!</strong></p>
                    <p>✅ No API costs • ✅ Unlimited messages • ✅ Open source (Baileys)</p>
                    <p>⚠️ Keep this admin panel open to maintain WhatsApp connection</p>
                </div>
            </div>
        </div>
    );
};

export default AuctionNotifier;
