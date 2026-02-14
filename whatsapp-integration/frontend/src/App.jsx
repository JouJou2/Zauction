import React, { useState } from 'react';
import PhoneAuth from './components/PhoneAuth';
import AuctionNotifier from './components/AuctionNotifier';
import './App.css';

function App() {
    const [view, setView] = useState('home'); // 'home', 'auth', 'admin'
    const [user, setUser] = useState(null);

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setView('home');
    };

    return (
        <div className="App">
            {view === 'home' && (
                <div className="home-container">
                    <div className="home-card">
                        <h1>🎉 FREE WhatsApp Integration</h1>
                        <p className="home-subtitle">
                            Phone Authentication & Auction Notifications
                        </p>

                        <div className="features">
                            <div className="feature">
                                <span className="feature-icon">✅</span>
                                <div>
                                    <h3>100% Free</h3>
                                    <p>No API costs, no monthly fees</p>
                                </div>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🔐</span>
                                <div>
                                    <h3>Phone Authentication</h3>
                                    <p>OTP verification via WhatsApp</p>
                                </div>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🔔</span>
                                <div>
                                    <h3>Auction Notifications</h3>
                                    <p>Instant alerts to all users</p>
                                </div>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">⚡</span>
                                <div>
                                    <h3>Open Source</h3>
                                    <p>Built with Baileys library</p>
                                </div>
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                className="btn btn-primary"
                                onClick={() => setView('auth')}
                            >
                                📱 Try Phone Authentication
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setView('admin')}
                            >
                                🔔 Admin: Send Notifications
                            </button>
                        </div>

                        <div className="tech-stack">
                            <p><strong>Tech Stack:</strong></p>
                            <p>Backend: Node.js + Express + Baileys + SQLite</p>
                            <p>Frontend: React</p>
                            <p>Cost: $0.00 forever! 🎉</p>
                        </div>
                    </div>
                </div>
            )}

            {view === 'auth' && (
                <div>
                    <button
                        className="back-button"
                        onClick={() => setView('home')}
                    >
                        ← Back to Home
                    </button>
                    <PhoneAuth onSuccess={handleAuthSuccess} />
                </div>
            )}

            {view === 'admin' && (
                <div>
                    <button
                        className="back-button"
                        onClick={() => setView('home')}
                    >
                        ← Back to Home
                    </button>
                    <AuctionNotifier />
                </div>
            )}
        </div>
    );
}

export default App;
