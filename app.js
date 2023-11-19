const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const Post = require('./models/Post');
const config = require('./config');

const app = express();
const PORT = config.port || 3000



function authenticate(req, res, next) {
  const providedUsername = req.body.login;
  const providedPassword = req.body.senha;

  console.log('Provided Username:', providedUsername);
  console.log('Provided Password:', providedPassword);

  if (providedUsername === config.login && providedPassword === config.senha) {
    req.session.isAdmin = true;
    console.log('Authentication Success');
    next();
  } else {
    req.session.isAdmin = false;
    console.log('Authentication Failed');
    res.status(401).send('<h1>Credenciais inválidas</h1>');
  }
}

app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(session({ secret: 'your-secret-key', saveUninitialized: true, resave: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  const isAdmin = req.session.isAdmin || false;
  Post.findAll({ order: [['id', 'DESC']] })
    .then((posts) => {
      res.render('home', { posts: posts, isAdmin: isAdmin });
    })
    .catch((error) => {
      console.error('Erro ao buscar postagens:', error);
      res.status(500).json({ msg: 'Erro interno do servidor' });
    });
});

app.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/');
});

app.get('/admin', (req, res) => {
  res.render('admin.handlebars');
});

app.post('/admin', authenticate, (req, res) => {
  res.redirect('/');
});

app.get('/cadastro', (req, res) => {
  const isAdmin = req.session.isAdmin || false;

  if (isAdmin) {
    res.render('formulario.handlebars');
  } else {
    res.redirect('/admin'); // Redireciona para a página de login se não estiver autenticado
  }
});

app.post('/add', (req, res) => {
  let titulo = req.body.titulo;
  let conteudo = req.body.conteudo;

  Post.create({
    titulo: titulo,
    conteudo: conteudo
  }).then(() => {
    res.redirect('/');
  }).catch((error) => {
    res.json({ msg: 'Postagem não foi realizada ' + error });
  });
});

app.get('/deletar/:id', (req, res) => {
  const isAdmin = req.session.isAdmin || false;
  if (isAdmin) {
    let id = req.params.id;
    Post.destroy({ where: { 'id': id } }).then(() => {
      res.redirect('/');
    }).catch((erro) => {
      res.json({ msg: 'Não foi possível deletar o post ' + erro });
    });
  } else {
    res.status(403).send('<h1>Acesso proibido</h1>'); // 403 Forbidden se não for administrador
  }
});    




app.listen(PORT, () => {
  const data = new Date();
  const options = { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
  console.log("Servidor iniciado em " + data.toLocaleString('pt-BR', options));
});
