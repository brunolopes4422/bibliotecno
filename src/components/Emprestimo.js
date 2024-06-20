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
  const [searchTerm, setSearchTerm] = useState('');

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
      setEmprestimos([...emprestimos, { id: novoEmprestimoRef.id, alunoId: selectedAluno.value, alunoNome: selectedAluno.label, livroId: selectedLivro.value, livroTitulo: selectedLivro.label, dataEmprestimo: dataEmprestimoTimestamp, dataDevolucao: dataDevolucao }]);

      // Diminuir a quantidade do livro
      const livroDocRef = doc(db, 'livros', selectedLivro.value);
      const livroData = livros.find(livro => livro.id === selectedLivro.value);
      await updateDoc(livroDocRef, { quantidade: livroData.quantidade - 1 });

      // Recarregar a lista de livros
      fetchLivros();

      // Imprimir a nota de empréstimo
      printNotaEmprestimo(selectedAluno.label, selectedLivro.label, dataEmprestimo, dataDevolucao);

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

  function printNotaEmprestimo(alunoNome, livroTitulo, dataEmprestimo, dataDevolucao) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota de Empréstimo</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .nota { margin: 20px; padding: 20px; border: 1px solid #000; }
            .nota h2 { text-align: center; }
            .nota p { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="nota">
            <h2>Nota de Empréstimo</h2>
            <p><strong>Aluno:</strong> ${alunoNome}</p>
            <p><strong>Livro:</strong> ${livroTitulo}</p>
            <p><strong>Data do Empréstimo:</strong> ${new Date(dataEmprestimo).toLocaleDateString()}</p>
            <p><strong>Data de Devolução:</strong> ${new Date(dataDevolucao).toLocaleDateString()}</p>
            <p>Assinatura do Aluno: __________________________</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  const filteredEmprestimos = emprestimos.filter(emprestimo =>
    emprestimo.alunoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emprestimo.livroTitulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Registrar Empréstimo</h2>
      <form onSubmit={handleEmprestimoSubmit}>
        <label>
          Selecione o Aluno:
          <Select
            value={selectedAluno}
            options={alunos.map(aluno => ({ value: aluno.id, label: aluno.nome }))}
            onChange={(selectedOption) => setSelectedAluno(selectedOption)}
            placeholder="Digite o nome do aluno"
            required
          />
        </label>
        <label>
          Selecione o Livro:
          <Select
            value={selectedLivro}
            options={livros.filter(livro => livro.quantidade > 0).map(livro => ({ value: livro.id, label: livro.titulo }))}
            onChange={(selectedOption) => setSelectedLivro(selectedOption)}
            placeholder="Digite o título do livro"
            required
          />
        </label>
        <div>
          <label htmlFor="isbnInput">Ou busque pelo ISBN do livro:</label>
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
      <input
        type="text"
        placeholder="Pesquisar empréstimos"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ul>
        {filteredEmprestimos.map(emprestimo => (
          <li key={emprestimo.id}>
            Aluno: {emprestimo.alunoNome} - Livro: {emprestimo.livroTitulo} - Data: {new Date(emprestimo.dataEmprestimo).toLocaleDateString()} - Data de Devolução: {new Date(emprestimo.dataDevolucao).toLocaleDateString()}
            <button onClick={() => printNotaEmprestimo(emprestimo.alunoNome, emprestimo.livroTitulo, emprestimo.dataEmprestimo, emprestimo.dataDevolucao)}>Reimprimir</button>
          </li>
        ))}
      </ul>
      {loading && <p>Carregando...</p>}
    </div>
  );
}
