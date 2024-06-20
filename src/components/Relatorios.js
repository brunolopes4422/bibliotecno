import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import './Relatorios.css';

export default function Relatorios() {
  const [alunos, setAlunos] = useState([]);
  const [livros, setLivros] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAlunos();
    fetchLivros();
    fetchEmprestimos();
  }, []);

  async function fetchAlunos() {
    try {
      const q = query(collection(db, 'alunos'), orderBy('nome'));
      const querySnapshot = await getDocs(q);
      const alunosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlunos(alunosList);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    }
  }

  async function fetchLivros() {
    try {
      const q = query(collection(db, 'livros'), orderBy('titulo'));
      const querySnapshot = await getDocs(q);
      const livrosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLivros(livrosList);
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
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
    }
  }

  function handleReportSelection(report) {
    setSelectedReport(report);
  }

  function handleSearchQueryChange(event) {
    setSearchQuery(event.target.value);
  }

  function calculateDaysLate(dueDate) {
    const currentDate = new Date();
    const due = new Date(dueDate);
    const timeDiff = currentDate - due;
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  function formatMessage(alunoNome, livroTitulo, daysLate) {
    return `Olá ${alunoNome}, o livro ${livroTitulo} que você pegou em nossa biblioteca está com atraso para devolução de ${daysLate} dias. Pedimos que vá à biblioteca para corrigir a situação!`;
  }

  function openWhatsApp(alunoNumero, alunoNome, livroTitulo, daysLate) {
    const message = formatMessage(alunoNome, livroTitulo, daysLate);
    const url = `https://api.whatsapp.com/send?phone=${alunoNumero}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function filterItems(items) {
    return items.filter(
      item =>
        (item.alunoNome && item.alunoNome.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.livroTitulo && item.livroTitulo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  function filterLivrosCadastrados(items) {
    return items.filter(livro =>
      livro.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  function filterAlunosCadastrados(items) {
    return items.filter(aluno =>
      aluno.nome.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  function renderSelectedReport() {
    let filteredItems = [];

    switch (selectedReport) {
      case 'alunosCadastrados':
        const filteredAlunos = filterAlunosCadastrados(alunos);
        return (
          <div>
            <h3>Relatório de Alunos Cadastrados</h3>
            <input type="text" placeholder="Pesquisar alunos..." value={searchQuery} onChange={handleSearchQueryChange} className="relatorios-search-input" />
            <ul className="relatorios-list">
              {filteredAlunos.map(aluno => (
                <li key={aluno.id}>
                  Nome: {aluno.nome} - Telefone: {aluno.telefone}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'livrosCadastrados':
        const filteredLivros = filterLivrosCadastrados(livros);
        return (
          <div>
            <h3>Relatório de Livros Cadastrados</h3>
            <input type="text" placeholder="Pesquisar livros..." value={searchQuery} onChange={handleSearchQueryChange} className="relatorios-search-input" />
            <ul className="relatorios-list">
              {filteredLivros.map(livro => (
                <li key={livro.id}>
                  Título: {livro.titulo} - Quantidade: {livro.quantidade}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'livrosEmprestados':
        filteredItems = filterItems(emprestimos);
        return (
          <div>
            <h3>Relatório de Livros Emprestados</h3>
            <input type="text" placeholder="Pesquisar livros ou alunos..." value={searchQuery} onChange={handleSearchQueryChange} className="relatorios-search-input" />
            <table className="relatorios-table">
              <thead>
                <tr>
                  <th>Livro</th>
                  <th>Aluno</th>
                  <th>Data de Empréstimo</th>
                  <th>Data Prevista de Devolução</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(emprestimo => (
                  <tr key={emprestimo.id}>
                    <td>{emprestimo.livroTitulo}</td>
                    <td>{emprestimo.alunoNome}</td>
                    <td>{new Date(emprestimo.dataEmprestimo).toLocaleDateString()}</td>
                    <td>{new Date(emprestimo.dataDevolucao).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'livrosAtrasados':
        filteredItems = filterItems(emprestimos.filter(emprestimo => new Date(emprestimo.dataDevolucao) < new Date()));
        return (
          <div>
            <h3>Relatório de Livros Atrasados para Devolução</h3>
            <input type="text" placeholder="Pesquisar livros ou alunos..." value={searchQuery} onChange={handleSearchQueryChange} className="relatorios-search-input" />
            <table className="relatorios-table">
              <thead>
                <tr>
                  <th>Livro</th>
                  <th>Aluno</th>
                  <th>Data Prevista de Devolução</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(emprestimo => {
                  const aluno = alunos.find(a => a.nome === emprestimo.alunoNome);
                  const daysLate = calculateDaysLate(emprestimo.dataDevolucao);
                  return (
                    <tr key={emprestimo.id}>
                      <td>{emprestimo.livroTitulo}</td>
                      <td>{emprestimo.alunoNome}</td>
                      <td>{new Date(emprestimo.dataDevolucao).toLocaleDateString()}</td>
                      <td className="relatorios-actions">
                        {aluno && (
                          <button onClick={() => openWhatsApp(aluno.telefone, emprestimo.alunoNome, emprestimo.livroTitulo, daysLate)}>
                            Enviar mensagem pelo WhatsApp
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="relatorios-container">
      <h2 className="relatorios-header">Relatórios</h2>
      <div className="relatorios-buttons">
        <button onClick={() => handleReportSelection('alunosCadastrados')}>Relatório de Alunos Cadastrados</button>
        <button onClick={() => handleReportSelection('livrosCadastrados')}>Relatório de Livros Cadastrados</button>
        <button onClick={() => handleReportSelection('livrosEmprestados')}>Relatório de Livros Emprestados</button>
        <button onClick={() => handleReportSelection('livrosAtrasados')}>Livros Atrasados para Devolução</button>
      </div>
      {renderSelectedReport()}
      {loading && <p>Carregando...</p>}
    </div>
  );
}
