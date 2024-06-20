import React, { useRef, useState, useEffect } from 'react';
import { db, storage } from '../services/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import './CadastrarLivro.css';

export default function CadastrarLivro() {
  const [livros, setLivros] = useState([]);
  const [filteredLivros, setFilteredLivros] = useState([]);
  const [editingLivro, setEditingLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const tituloRef = useRef();
  const autorRef = useRef();
  const editoraRef = useRef();
  const isbnRef = useRef();
  const anoRef = useRef();
  const sinopseRef = useRef();
  const imagemRef = useRef();
  const quantidadeRef = useRef();
  const searchRef = useRef();
  const topRef = useRef(null); // Referência para o elemento vazio no topo

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
    const isbn = isbnRef.current.value;
    const existingBook = livros.find(livro => livro.isbn === isbn);

    if (existingBook && !editingLivro) {
      setStatusMessage('Já existe um livro cadastrado com este ISBN.');
      return;
    }

    const titulo = tituloRef.current.value;
    const autor = autorRef.current.value;
    const editora = editoraRef.current.value;
    const ano = anoRef.current.value;
    const sinopse = sinopseRef.current.value;
    const quantidade = quantidadeRef.current.value;
    const imagemFile = imagemRef.current.files[0];

    let imageUrl = '';

    if (imagemFile) {
      const storageRef = ref(storage, `livros/${imagemFile.name}`);
      await uploadBytes(storageRef, imagemFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    if (editingLivro) {
      const livroDoc = doc(db, 'livros', editingLivro.id);
      await updateDoc(livroDoc, { titulo, autor, editora, isbn, ano, sinopse, quantidade, imagem: imageUrl || editingLivro.imagem });
      setEditingLivro(null);
    } else {
      await addDoc(collection(db, 'livros'), { titulo, autor, editora, isbn, ano, sinopse, quantidade, imagem: imageUrl });
    }

    handleClearFields();
    fetchLivros();
  }

  async function handleEdit(livro) {
    // Rola a página até o topo
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    tituloRef.current.value = livro.titulo;
    autorRef.current.value = livro.autor;
    editoraRef.current.value = livro.editora;
    isbnRef.current.value = livro.isbn;
    anoRef.current.value = livro.ano;
    sinopseRef.current.value = livro.sinopse;
    quantidadeRef.current.value = livro.quantidade;
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

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  async function handleFetchBookData() {
    const isbn = isbnRef.current.value;
    if (isbn) {
      try {
        const response = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const bookData = response.data[`ISBN:${isbn}`];
        if (bookData) {
          tituloRef.current.value = bookData.title || '';
          autorRef.current.value = bookData.authors ? bookData.authors.map(author => author.name).join(', ') : '';
          editoraRef.current.value = bookData.publishers ? bookData.publishers.map(publisher => publisher.name).join(', ') : '';
          anoRef.current.value = bookData.publish_date ? formatDate(bookData.publish_date) : '';
          sinopseRef.current.value = bookData.description ? bookData.description.value || bookData.description : '';
          if (bookData.cover) {
            const olid = bookData.identifiers.openlibrary[0];
            const imageUrl = `https://covers.openlibrary.org/b/olid/${olid}-M.jpg`;
            // Usamos `src` apenas para exibir a imagem a partir da URL
            imagemRef.current.src = imageUrl;
          }
          setStatusMessage('Livro encontrado e informações preenchidas.');
        } else {
          setStatusMessage('Livro não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do livro:', error);
        setStatusMessage('Erro ao buscar dados do livro.');
      }
    }
  }

  function handleClearFields() {
    tituloRef.current.value = '';
    autorRef.current.value = '';
    editoraRef.current.value = '';
    isbnRef.current.value = '';
    anoRef.current.value = '';
    sinopseRef.current.value = '';
    quantidadeRef.current.value = '';
    imagemRef.current.value = '';
    searchRef.current.value = '';
    setStatusMessage('');
  }

  return (
    <div className="container">
      <div ref={topRef}></div>
      <h2>Cadastrar Livro</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input type="text" ref={tituloRef} required placeholder="Título" className="full-width" />
        </div>
        <div className="form-group">
          <input type="text" ref={autorRef} required placeholder="Autor" className="full-width" />
        </div>
        <div className="form-group">
          <input type="text" ref={editoraRef} required placeholder="Editora" className="full-width" />
        </div>
        <div className="form-group">
          <input type="text" ref={isbnRef} required placeholder="ISBN" className="full-width" />
        </div>
        <div className="form-group">
          <input type="text" ref={anoRef} required placeholder="Ano de Lançamento" className="full-width" />
        </div>
        <div className="form-group">
          <textarea type="text" ref={sinopseRef} placeholder="Sinopse" className="full-width" />
        </div>
        <div className="form-group">
          <input type="number" ref={quantidadeRef} required placeholder="Quantidade" className="full-width" />
        </div>
        <div className="form-group">
          <input
            type="file"
            ref={imagemRef}
            accept="image/*"
            className="full-width"
            style={{ width: 'calc(100% - 120px)' }} // Estilo inline para diminuir a largura
          />
        </div>
        <div className="form-group">
          <button type="submit" className="full-width">{editingLivro ? 'Atualizar' : 'Cadastrar'}</button>
        </div>
        <div className="form-group">
          <button type="button" onClick={handleFetchBookData} className="full-width">Buscar Livro</button>
        </div>
        <div className="form-group">
          <button type="button" onClick={handleClearFields} className="full-width">Limpar Campos</button>
        </div>
      </form>
      {statusMessage && <p className="status-message">{statusMessage}</p>}
      <h2 className=''>Lista de Livros</h2>
      <input
        type="text"
        ref={searchRef}
        placeholder="Pesquisar"
        onChange={handleSearch}
        className="search-input full-width"
      />
      {loading ? <p>Carregando...</p> : (
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Editora</th>
              {/*<th>ISBN</th>*/}
              {/*<th>Ano</th>*/}
              <th>Quantidade</th>
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
                 {/* <td>{livro.isbn}</td>
                <td>{livro.ano}</td>*/}
                <td>{livro.quantidade}</td>
                <td><img src={livro.imagem} alt="Capa do Livro" /></td>
                <td>
                  <button onClick={() => handleEdit(livro)} className="full-width">Editar</button>
                  <button onClick={() => handleDelete(livro.id)} className="full-width">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

