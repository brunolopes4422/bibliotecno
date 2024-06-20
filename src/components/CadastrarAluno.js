import React, { useRef, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import InputMask from 'react-input-mask';
import './CadastrarAluno.css';

export default function CadastrarAluno() {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [editingAluno, setEditingAluno] = useState(null);
  const [loading, setLoading] = useState(true);
  const nomeRef = useRef();
  const emailRef = useRef();
  const telefoneRef = useRef();
  const enderecoRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
    fetchAlunos();
  }, []);

  async function fetchAlunos() {
    const q = query(collection(db, 'alunos'));
    const querySnapshot = await getDocs(q);
    const alunosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAlunos(alunosList);
    setFilteredAlunos(alunosList);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nome = nomeRef.current.value;
    const email = emailRef.current.value;
    const telefone = telefoneRef.current.value;
    const endereco = enderecoRef.current.value;

    if (editingAluno) {
      const alunoDoc = doc(db, 'alunos', editingAluno.id);
      await updateDoc(alunoDoc, { nome, email, telefone, endereco });
      setEditingAluno(null);
    } else {
      await addDoc(collection(db, 'alunos'), { nome, email, telefone, endereco });
    }

    clearFields();
    fetchAlunos();
  }

  async function handleEdit(aluno) {
    nomeRef.current.value = aluno.nome;
    emailRef.current.value = aluno.email;
    telefoneRef.current.value = aluno.telefone;
    enderecoRef.current.value = aluno.endereco;
    setEditingAluno(aluno);
  }

  async function handleDelete(alunoId) {
    const q = query(collection(db, 'emprestimos'), where('alunoId', '==', alunoId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const alunoDoc = doc(db, 'alunos', alunoId);
      await deleteDoc(alunoDoc);
      fetchAlunos();
    } else {
      alert('Não é possível excluir um aluno com empréstimos associados.');
    }
  }

  function handleSearch() {
    const searchTerm = searchRef.current.value.toLowerCase();
    const filtered = alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(searchTerm) ||
      aluno.email.toLowerCase().includes(searchTerm) ||
      aluno.telefone.toLowerCase().includes(searchTerm) ||
      aluno.endereco.toLowerCase().includes(searchTerm)
    );
    setFilteredAlunos(filtered);
  }

  function clearFields() {
    nomeRef.current.value = '';
    emailRef.current.value = '';
    telefoneRef.current.value = '';
    enderecoRef.current.value = '';
    searchRef.current.value = '';
  }

  return (
    <div className="container">
      <h2>Cadastrar Aluno</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" ref={nomeRef} required placeholder="Nome" />
        <input type="email" ref={emailRef} required placeholder="Email" />
        <InputMask
          mask="+55 (99) 99999-9999"
          maskChar=""
          ref={telefoneRef}
          required
          placeholder="Telefone"
          className='search-input'
        />
        <input type="text" ref={enderecoRef} required placeholder="Endereço" />
        <button type="submit">{editingAluno ? 'Atualizar' : 'Cadastrar'}</button>
      </form>
      <h2>Lista de Alunos</h2>
      <input
        className="search-input"
        type="text"
        ref={searchRef}
        placeholder="Pesquisar"
        onChange={handleSearch}
      />
      {loading ? <p>Carregando...</p> : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlunos.map(aluno => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.email}</td>
                <td>{aluno.telefone}</td>
                <td>{aluno.endereco}</td>
                <td>
                  <button onClick={() => handleEdit(aluno)}>Editar</button>
                  {/* <button onClick={() => handleDelete(aluno.id)}>Excluir</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
