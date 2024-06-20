// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CadastrarLivro from './components/CadastrarLivro';
import CadastrarAluno from './components/CadastrarAluno';
import Emprestimo from './components/Emprestimo';
import Devolucao from './components/Devolucao';
import Relatorios from './components/Relatorios';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastrar-livro" element={<PrivateRoute><CadastrarLivro /></PrivateRoute>} />
          <Route path="/cadastrar-aluno" element={<PrivateRoute><CadastrarAluno /></PrivateRoute>} />
          <Route path="/emprestimo" element={<PrivateRoute><Emprestimo /></PrivateRoute>} />
          <Route path="/devolucao" element={<PrivateRoute><Devolucao /></PrivateRoute>} />
          <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
