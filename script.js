const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const notifier = require('node-notifier')
var bodyParser = require( 'body-parser' )
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//conectar com o banco de dados
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'abcd',
  database: 'loginexpress'
})
connection.connect()

//usar arquivos css
app.use("/login", express.static(__dirname + "/estilos"));
app.use("/conectado", express.static(__dirname + "/estilos"));

//variável que definirá se o usuário fez o login ou não
var usuarioConectado = false;

//validar login
app.post('/login', (req, res) => {
  const usuario = req.body.campoUsuario;
  const senhaInserida = req.body.campoSenha;
  connection.query('SELECT * FROM usuarios WHERE nome = ?', usuario, (err, rows, fields) => {
    if (rows.length == 0){
      notifier.notify("usuário não encontrado!");
      res.status(204).send();    
    }
    else{
      if(rows[0]["senha"] != senhaInserida){
          notifier.notify("senha incorreta!");
          res.status(204).send();    
        }
      else{
        notifier.notify("você está conectado!");
        usuarioConectado = true;
        res.redirect("/conectado");
      };
    };
  });
});

//redirecionar para a página de login caso o usuário tente acessar a página inicial
app.get("/", (req, res) => {
  res.redirect("/login");
})

//mudar valor da variável automaticamente quando a página for acessada
app.get("/login", (req,res) => {
  usuarioConectado = false;
  res.sendFile(path.join(__dirname, "/paginaLogin.html"));
})

//não permitir que o usuário acesse a página caso não tenha feito login
app.get("/conectado", (req, res) => {
  if(usuarioConectado == false){
    res.redirect("/login")
    notifier.notify("Login ainda não efetuado!");
  }
  else{res.sendFile(path.join(__dirname, "/paginaConectado.html"));}
});

//executar servidor na porta 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})