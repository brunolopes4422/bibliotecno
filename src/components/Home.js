// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Home.css';
import './BookModal.css'; // Import the CSS for the modal

export default function Home() {
  const [livros, setLivros] = useState([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [emprestimos, setEmprestimos] = useState([]);
  const [selectedLivro, setSelectedLivro] = useState(null);

  useEffect(() => {
    fetchLivros();
    fetchEmprestimos();
  }, []);

  async function fetchLivros() {
    try {
      const q = query(collection(db, 'livros'), orderBy('titulo'));
      const querySnapshot = await getDocs(q);
      const livrosList = querySnapshot.docs.map(doc => {
        const livroData = doc.data();
        return {
          id: doc.id,
          ...livroData,
          disponivel: livroData.quantidade >= 1 // Verifica se a quantidade é maior ou igual a 1
        };
      });
      setLivros(livrosList);
      setLivrosFiltrados(livrosList);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    }
  }

  async function fetchEmprestimos() {
    try {
      const q = query(collection(db, 'emprestimos'));
      const querySnapshot = await getDocs(q);
      const emprestimosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmprestimos(emprestimosList);
    } catch (error) {
      console.error('Erro ao buscar emprestimos:', error);
    }
  }

  function handlePesquisa(e) {
    const value = e.target.value.toLowerCase();
    setPesquisa(value);
    const livrosFiltrados = livros.filter(livro =>
      (livro.titulo && livro.titulo.toLowerCase().includes(value)) ||
      (livro.autor && livro.autor.toLowerCase().includes(value)) ||
      (livro.editora && livro.editora.toLowerCase().includes(value))
    ).map(livro => ({
      ...livro,
      disponivel: livro.quantidade >= 1 // Se a quantidade for maior ou igual a 1, está disponível
    }));
    setLivrosFiltrados(livrosFiltrados);
  }

  function handleBookClick(livro) {
    setSelectedLivro(livro);
  }

  function handleCloseModal() {
    setSelectedLivro(null);
  }

  function handleOverlayClick(e) {
    if (e.target.className === 'modal-overlay') {
      handleCloseModal();
    }
  }

  return (
    <div className="home-container">
      <h2>Biblioteca Teodomiro</h2>
      <h2>Veja aqui os livros disponíveis em nossa biblioteca</h2>
      <input
        type="text"
        placeholder="Pesquisar livros..."
        value={pesquisa}
        onChange={handlePesquisa}
        className="search-input"
      />
      {loading ? <p>Carregando...</p> : (
        <div className="books-grid">
          {livrosFiltrados.map(livro => (
            <div
              key={livro.id}
              className={`book-card ${!livro.disponivel ? 'not-available' : ''}`}
              onClick={() => handleBookClick(livro)}
            >
              <img src={livro.imagem} alt={livro.titulo} className="book-image" />
              <div className="book-info">
                <h3>{livro.titulo}</h3>
                <p>Autor: {livro.autor}</p>
                <p>Editora: {livro.editora}</p>
                <p>Disponível: {livro.disponivel ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedLivro && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>&times;</button>
            <h2>{selectedLivro.titulo}</h2>
            <p>Autor: {selectedLivro.autor}</p>
            <p>Editora: {selectedLivro.editora}</p>
            <p>Quantidade: {selectedLivro.quantidade}</p>
            <p>Sinopse: {selectedLivro.sinopse}</p>
            <h3>Alunos com Empréstimos</h3>
            <ul>
              {emprestimos
                .filter(emprestimo => emprestimo.livroId === selectedLivro.id)
                .map(emprestimo => (
                  <li key={emprestimo.id}>{emprestimo.alunoNome}</li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
