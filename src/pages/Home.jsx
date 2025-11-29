import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Connect with Your Elected Representatives</h1>
          <p>
            Bridge the gap between citizens and politicians. Report issues, provide
            feedback, and receive updates to improve transparency and responsiveness
            in governance.
          </p>
          {!user && (
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started
            </Link>
          )}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Citizens</h3>
              <p>Report issues, provide feedback, and track progress on community concerns.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <h3>Politicians</h3>
              <p>Respond to concerns, post updates, and engage directly with constituents.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Moderators</h3>
              <p>Ensure respectful communication and maintain platform integrity.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>Admins</h3>
              <p>Oversee operations, manage users, and ensure data integrity.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <h2>Platform Benefits</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <h4>📢 Transparent Communication</h4>
              <p>Direct channel between citizens and their representatives</p>
            </div>
            <div className="benefit-item">
              <h4>⚡ Quick Response</h4>
              <p>Get timely updates on reported issues and concerns</p>
            </div>
            <div className="benefit-item">
              <h4>🎯 Focused Action</h4>
              <p>Prioritize issues based on community needs and votes</p>
            </div>
            <div className="benefit-item">
              <h4>📊 Progress Tracking</h4>
              <p>Monitor the status of issues from report to resolution</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
