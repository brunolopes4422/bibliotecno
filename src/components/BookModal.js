// src/components/BookModal.js
import React from 'react';
import './BookModal.css';

export default function BookModal({ livro, emprestimos, onClose }) {
  if (!livro) return null;

  const emprestimosDoLivro = emprestimos.filter(e => e.livroId === livro.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{livro.titulo}</h2>
        <p><strong>Autor:</strong> {livro.autor}</p>
        <p><strong>Editora:</strong> {livro.editora}</p>
        <p><strong>Sinopse:</strong> {livro.sinopse}</p>
        <h3>Alunos com o livro emprestado:</h3>
        {emprestimosDoLivro.length > 0 ? (
          <ul>
            {emprestimosDoLivro.map(emprestimo => (
              <li key={emprestimo.id}>{emprestimo.alunoNome}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum aluno está com este livro emprestado no momento.</p>
        )}
      </div>
    </div>
  );
}
