import React from 'react';

export default function NotaEmprestimo({ aluno, livro, dataEmprestimo }) {
  const alunoNome = aluno ? aluno.nome : '';
  const livroTitulo = livro ? livro.titulo : '';

  return (
    <div className="nota-emprestimo">
      <h2>Nota de Empréstimo</h2>
      <p>Aluno: {alunoNome}</p>
      <p>Livro: {livroTitulo}</p>
      <p>Data do Empréstimo: {dataEmprestimo}</p>
    </div>
  );
}
