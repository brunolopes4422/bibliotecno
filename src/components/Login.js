import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './login.css'; // Importa o arquivo CSS

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!emailRef.current.value || !passwordRef.current.value) {
      return setError('Por favor, preencha todos os campos.');
    }

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch {
      setError('Falha ao entrar');
    }

    setLoading(false);
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        {error && <p>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="email" ref={emailRef} required placeholder="Email" className="input-email" />
          <input type="password" ref={passwordRef} required placeholder="Senha" />
          <button type="submit" disabled={loading}>Login</button>
        </form>
      </div>
    </div>
  );
}
