import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import Select from 'react-select';
import './emprestimo.css';

export default function Emprestimo() {
  const [alunos, setAlunos] = useState([]);
  const [livros, setLivros] = useState([]);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [selectedLivro, setSelectedLivro] = useState(null);
  const [dataEmprestimo, setDataEmprestimo] = useState(new Date().toISOString().split('T')[0]);
  const [emprestimos, setEmprestimos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isbnInput, setIsbnInput] = useState('');
  const [searchedLivro, setSearchedLivro] = useState(null);

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

  function calculateDataDevolucao(dataEmprestimo) {
    const data = new Date(dataEmprestimo);
    data.setDate(data.getDate() + 15);
    return data.toISOString().split('T')[0];
  }

  async function handleEmprestimoSubmit(e) {
    e.preventDefault();
    if (!selectedAluno || !selectedLivro || !dataEmprestimo) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    const dataEmprestimoTimestamp = new Date(dataEmprestimo).toISOString();
    const dataDevolucao = calculateDataDevolucao(dataEmprestimo);

    try {
      // Registrar o empréstimo
      const novoEmprestimoRef = await addDoc(collection(db, 'emprestimos'), {
        alunoId: selectedAluno.value,
        alunoNome: selectedAluno.label,
        livroId: selectedLivro.value,
        livroTitulo: selectedLivro.label,
        dataEmprestimo: dataEmprestimoTimestamp,
        dataDevolucao: dataDevolucao
      });

      // Atualizar estado para incluir o novo empréstimo
      setEmprestimos([...emprestimos, { id: novoEmprestimoRef.id, alunoId: selectedAluno.value, livroId: selectedLivro.value, dataEmprestimo: dataEmprestimoTimestamp, dataDevolucao: dataDevolucao }]);

      // Diminuir a quantidade do livro
      const livroDocRef = doc(db, 'livros', selectedLivro.value);
      const livroData = livros.find(livro => livro.id === selectedLivro.value);
      await updateDoc(livroDocRef, { quantidade: livroData.quantidade - 1 });

      // Recarregar a lista de livros
      fetchLivros();

      alert('Empréstimo registrado com sucesso!');
      setSelectedAluno(null);
      setSelectedLivro(null);
      setDataEmprestimo(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Erro ao registrar empréstimo:', error);
      alert('Erro ao registrar empréstimo. Por favor, tente novamente.');
    }
  }

  async function handleIsbnSearch() {
    const foundLivro = livros.find(livro => livro.isbn.toLowerCase() === isbnInput.toLowerCase());
    if (foundLivro) {
      setSearchedLivro(foundLivro);
      setSelectedLivro({ value: foundLivro.id, label: foundLivro.titulo });
    } else {
      alert('Livro não encontrado com o ISBN fornecido.');
    }
  }

  return (
    <div>
      <h2>Registrar Empréstimo</h2>
      <form onSubmit={handleEmprestimoSubmit}>
        <label>
          Selecionar Aluno:
          <Select
            value={selectedAluno}
            options={alunos.map(aluno => ({ value: aluno.id, label: aluno.nome }))}
            onChange={(selectedOption) => setSelectedAluno(selectedOption)}
            placeholder="Digite o nome do aluno"
            required
          />
        </label>
        <label>
          Selecionar Livro:
          <Select
            value={selectedLivro}
            options={livros.filter(livro => livro.quantidade > 0).map(livro => ({ value: livro.id, label: livro.titulo }))}
            onChange={(selectedOption) => setSelectedLivro(selectedOption)}
            placeholder="Digite o título do livro"
            required
          />
        </label>
        <div>
          <label htmlFor="isbnInput">Digite o ISBN do Livro:</label>
          <input
            id="isbnInput"
            type="text"
            value={isbnInput}
            onChange={(e) => setIsbnInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleIsbnSearch();
              }
            }}
            onBlur={() => handleIsbnSearch()}
            placeholder="Digite o ISBN do livro"
          />
          {searchedLivro && (
            <div>
              <p>ISBN: {searchedLivro.isbn}</p>
              <p>Título: {searchedLivro.titulo}</p>
            </div>
          )}
        </div>
        <label htmlFor="dataEmprestimo">Data do Empréstimo:</label>
        <input type="date" id="dataEmprestimo" value={dataEmprestimo} onChange={(e) => setDataEmprestimo(e.target.value)} required />
        <button type="submit">Registrar Empréstimo</button>
      </form>
      <h3>Empréstimos Registrados</h3>
      <ul>
        {emprestimos.map(emprestimo => (
          <li key={emprestimo.id}>
            Aluno: {emprestimo.alunoNome} - Livro: {emprestimo.livroTitulo} - Data: {new Date(emprestimo.dataEmprestimo).toLocaleDateString()} - Data de Devolução: {new Date(emprestimo.dataDevolucao).toLocaleDateString()}
          </li>
        ))}
      </ul>
      {loading && <p>Carregando...</p>}
    </div>
  );
}
