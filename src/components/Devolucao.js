import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';
import Select from 'react-select';
import './Devolucao.css';

export default function Devolucao() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filteredEmprestimos, setFilteredEmprestimos] = useState([]);
  const [selectedEmprestimo, setSelectedEmprestimo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmprestimos();
  }, []);

  useEffect(() => {
    setFilteredEmprestimos(
      emprestimos.filter(emprestimo =>
        emprestimo.alunoNome.toLowerCase().includes(searchInput.toLowerCase()) ||
        emprestimo.livroTitulo.toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [emprestimos, searchInput]);

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

  async function handleDevolucaoSubmit(e) {
    e.preventDefault();
    if (!selectedEmprestimo) {
      alert('Por favor, selecione um empréstimo para devolver.');
      return;
    }

    try {
      // Atualizar a quantidade do livro
      const emprestimo = emprestimos.find(emp => emp.id === selectedEmprestimo.value);
      const livroDocRef = doc(db, 'livros', emprestimo.livroId);
      const livroSnapshot = await getDocs(query(collection(db, 'livros'), where('__name__', '==', emprestimo.livroId)));
      const livroData = livroSnapshot.docs[0].data();

      await updateDoc(livroDocRef, { quantidade: livroData.quantidade + 1 });

      // Remover o empréstimo
      const emprestimoDocRef = doc(db, 'emprestimos', selectedEmprestimo.value);
      await deleteDoc(emprestimoDocRef);

      // Atualizar o estado para remover o empréstimo devolvido
      setEmprestimos(emprestimos.filter(emp => emp.id !== selectedEmprestimo.value));
      setFilteredEmprestimos(filteredEmprestimos.filter(emp => emp.id !== selectedEmprestimo.value));

      alert('Devolução registrada com sucesso!');
      setSelectedEmprestimo(null);
      setSearchInput('');
    } catch (error) {
      console.error('Erro ao registrar devolução:', error);
      alert('Erro ao registrar devolução. Por favor, tente novamente.');
    }
  }

  return (
    <div className="devolucao-container">
      <h2>Registrar Devolução</h2>
      <form className="devolucao-form" onSubmit={handleDevolucaoSubmit}>
        <label>
          Pesquisar Empréstimos:
          <div className="select-container">
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              value={selectedEmprestimo}
              options={filteredEmprestimos.map(emprestimo => ({
                value: emprestimo.id,
                label: `Aluno: ${emprestimo.alunoNome} - Livro: ${emprestimo.livroTitulo} - Data: ${new Date(emprestimo.dataEmprestimo).toLocaleDateString()}`
              }))}
              onChange={(selectedOption) => setSelectedEmprestimo(selectedOption)}
              onInputChange={(inputValue) => setSearchInput(inputValue)}
              placeholder="Digite para pesquisar"
              required
            />
          </div>
        </label>
        <button type="submit">Registrar Devolução</button>
      </form>
      <h3>Empréstimos Registrados</h3>
      <ul className="devolucao-list">
        {emprestimos.map(emprestimo => (
          <li key={emprestimo.id}>
            Aluno: {emprestimo.alunoNome} - Livro: {emprestimo.livroTitulo} - Data: {new Date(emprestimo.dataEmprestimo).toLocaleDateString()}
          </li>
        ))}
      </ul>
      {loading && <p>Carregando...</p>}
    </div>
  );
}
