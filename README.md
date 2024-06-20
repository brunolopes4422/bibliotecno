Descrição - Biblioteca Virtual
Visão Geral
Este repositório contém uma aplicação web de uma Biblioteca Virtual desenvolvida utilizando React para o frontend e Firebase Firestore para o backend. A aplicação permite gerenciar livros, alunos, empréstimos, e relatórios relacionados.



Funcionalidades Principais
Autenticação de Usuários: Utilização do Firebase Authentication para permitir que usuários se autentiquem na aplicação antes de acessar funcionalidades como cadastro de livros, empréstimos e relatórios.

Cadastro e Visualização de Livros: Os livros são cadastrados e armazenados no Firebase Firestore, permite cadastrar via ISBN do livro já buscando dados principais via APi,, permitindo que sejam listados e visualizados na interface da biblioteca virtual.

Empréstimos e Devoluções: Funcionalidade para registrar empréstimos de livros para alunos, com controle de datas de empréstimo e previsão de devolução. Também é possível registrar devoluções e calcular atrasos automaticamente.

Relatórios: Implementação de relatórios que fornecem informações detalhadas, como lista de alunos cadastrados, livros cadastrados, livros atualmente emprestados e livros que estão atrasados para devolução. Os relatórios permitem filtragem por nome de aluno, título do livro ou ambos.




Como Executar o Projeto
Para executar este projeto localmente, siga os passos abaixo:

Clone este repositório usando git clone https://github.com/seu-usuario/nome-do-repositorio.git.
Instale as dependências usando npm install.
Configure o Firebase seguindo a documentação oficial para criar seu projeto, adicionar o Firestore e configurar a autenticação.
Configure as variáveis de ambiente ou arquivo de configuração para conectar a aplicação ao seu projeto Firebase.
Execute a aplicação usando npm start e acesse-a no seu navegador através de http://localhost:3000.
