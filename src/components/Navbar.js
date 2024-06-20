// src/components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Import the CSS file

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isNavActive, setIsNavActive] = useState(false);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Acervo</Link>
      <button className="hamburger" onClick={toggleNav}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`navbar-nav ${isNavActive ? 'active' : ''}`}>
        {currentUser && (
          <>
            <li className="nav-item">
              <Link to="/cadastrar-livro" className="nav-link" onClick={toggleNav}>Cadastrar Livro</Link>
            </li>
            <li className="nav-item">
              <Link to="/cadastrar-aluno" className="nav-link" onClick={toggleNav}>Cadastrar Aluno</Link>
            </li>
            <li className="nav-item">
              <Link to="/emprestimo" className="nav-link" onClick={toggleNav}>Empréstimo</Link>
            </li>
            <li className="nav-item">
              <Link to="/devolucao" className="nav-link" onClick={toggleNav}>Devolução</Link>
            </li>
            <li className="nav-item">
              <Link to="/relatorios" className="nav-link" onClick={toggleNav}>Relatórios</Link>
            </li>
          </>
        )}
        <li className="nav-item">
          {currentUser ? (
            <button className="logout-btn" onClick={() => { toggleNav(); logout(); }}>Logout</button>
          ) : (
            <Link to="/login" className="nav-link" onClick={toggleNav}>Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
