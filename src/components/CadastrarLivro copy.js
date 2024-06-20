import React, { useRef, useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './CadastrarLivro.css';

export default function CadastrarLivro() {
  const [livros, setLivros] = useState([]);
  const [filteredLivros, setFilteredLivros] = useState([]);
  const [editingLivro, setEditingLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const tituloRef = useRef();
  const autorRef = useRef();
  const editoraRef = useRef();
  const isbnRef = useRef();
  const imagemRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
    fetchLivros();
  }, []);

  async function fetchLivros() {
    const q = collection(db, 'livros');
    const querySnapshot = await getDocs(q);
    const livrosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLivros(livrosList);
    setFilteredLivros(livrosList);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const titulo = tituloRef.current.value;
    const autor = autorRef.current.value;
    const editora = editoraRef.current.value;
    const isbn = isbnRef.current.value;
    const imagemFile = imagemRef.current.files[0]; // Arquivo da imagem selecionada

    let imageUrl = ''; // URL da imagem no Firebase Storage

    if (imagemFile) {
      const storageRef = ref(storage, `livros/${imagemFile.name}`);
      await uploadBytes(storageRef, imagemFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    if (editingLivro) {
      const livroDoc = doc(db, 'livros', editingLivro.id);
      await updateDoc(livroDoc, { titulo, autor, editora, isbn, imagem: imageUrl });
      setEditingLivro(null);
    } else {
      await addDoc(collection(db, 'livros'), { titulo, autor, editora, isbn, imagem: imageUrl });
    }

    tituloRef.current.value = '';
    autorRef.current.value = '';
    editoraRef.current.value = '';
    isbnRef.current.value = '';
    imagemRef.current.value = ''; // Limpar o campo de imagem após a submissão
    searchRef.current.value = '';
    fetchLivros();
  }

  async function handleEdit(livro) {
    tituloRef.current.value = livro.titulo;
    autorRef.current.value = livro.autor;
    editoraRef.current.value = livro.editora;
    isbnRef.current.value = livro.isbn;
    setEditingLivro(livro);
  }

  async function handleDelete(livroId) {
    const livroDoc = doc(db, 'livros', livroId);
    await deleteDoc(livroDoc);
    fetchLivros();
  }

  function handleSearch() {
    const searchTerm = searchRef.current.value.toLowerCase();
    const filtered = livros.filter(livro => 
      livro.titulo.toLowerCase().includes(searchTerm) ||
      livro.autor.toLowerCase().includes(searchTerm) ||
      livro.editora.toLowerCase().includes(searchTerm) ||
      livro.isbn.toLowerCase().includes(searchTerm)
    );
    setFilteredLivros(filtered);
  }

  return (
    <div className="container">
      <h2>Cadastrar Livro</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" ref={tituloRef} required placeholder="Título" />
        <input type="text" ref={autorRef} required placeholder="Autor" />
        <input type="text" ref={editoraRef} required placeholder="Editora" />
        <input type="text" ref={isbnRef} required placeholder="ISBN" />
        <input type="file" ref={imagemRef} accept="image/*" /> {/* Campo de upload de imagem */}
        <button type="submit">{editingLivro ? 'Atualizar' : 'Cadastrar'}</button>
      </form>
      <h2>Lista de Livros</h2>
      <input
        type="text"
        ref={searchRef}
        placeholder="Pesquisar"
        onChange={handleSearch}
        className="search-input"
      />
      {loading ? <p>Carregando...</p> : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Editora</th>
              <th>ISBN</th>
              <th>Imagem</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredLivros.map(livro => (
              <tr key={livro.id}>
                <td>{livro.titulo}</td>
                <td>{livro.autor}</td>
                <td>{livro.editora}</td>
                <td>{livro.isbn}</td>
                <td><img src={livro.imagem} alt="Capa do Livro" /></td> {/* Exibir a imagem do livro */}
                <td>
                  <button onClick={() => handleEdit(livro)}>Editar</button>
                  <button onClick={() => handleDelete(livro.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
