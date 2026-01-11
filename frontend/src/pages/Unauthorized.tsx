// AIModified:2026-01-11T06:08:23Z
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>403</h1>
        <h2 style={styles.subtitle}>Unauthorized</h2>
        <p style={styles.message}>
          You don't have permission to access this resource.
        </p>
        <button onClick={() => navigate('/dashboard')} style={styles.button}>
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  content: {
    textAlign: 'center',
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#666',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '1rem',
    color: '#999',
    marginBottom: '2rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
}
