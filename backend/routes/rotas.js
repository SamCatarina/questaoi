import express from "express";
import { saveRef, getReferences } from "../controllers/refs.js"; 
import { checkAnswers, saveAnswers, saveResultTags, checkIfExists, checkIfExistsAluno } from '../controllers/responses.js';
import { addQuestion, getQuestions } from "../controllers/questions.js";
import { inserirAluno, inserirProfessor } from '../controllers/cadastro.js';
import { checkLogin } from "../controllers/login.js";
import { participarTurma } from "../controllers/participateTurma.js";
import { criarTurma } from "../controllers/createTurma.js";
import { db } from "../db.js";
import { getChamada, getGrupos, salvarChamada, salvarGrupos } from "../controllers/grupos.js";
import { getTags } from "../controllers/tags.js";


const router = express.Router();

router.post("/professor/turma/novalista", addQuestion);
router.post("/professor/salvarGrupos", salvarGrupos);
router.get("/grupos/getGrupos", getGrupos);
router.post("/professor/salvarGrupos/api", salvarChamada)
router.get("/grupos/chamada", getChamada)
router.post("/professor/adicionarRef", saveRef);
router.get("/aluno/turma/lista/:listaId", getQuestions);
router.get("/aluno/turma/turmaRef/:turmaId", getReferences);
router.post("/aluno/turma/resultado", saveAnswers);
router.get("/aluno/turma/resultado/verificar", checkIfExists);
router.get("/aluno/turma/resultado/verificarAluno", checkIfExistsAluno);
router.get("/aluno/turma/:alunoId/lista/:listaId/resultado", checkAnswers);
router.post('/aluno/turma/:alunoId/lista/:listaId/salvarTags', saveResultTags);
router.post("/login", checkLogin);
router.post('/cadastro', async (req, res) => {

    const { username, password, email, userType, userFormatPref, userTurno } = req.body;
  
    try {
      if (userType === 'aluno') {
        await inserirAluno({ username, password, email, userFormatPref, userTurno});
      } else if (userType === 'professor') {
        await inserirProfessor({ username, password, email });
      }
  
      res.status(200).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao realizar cadastro' });
    }
  });

  router.post('/participar-turma', participarTurma);
  router.get('/turmas/:userId/:userType', (req, res) => {
    const userId = req.params.userId;
    const userType = req.params.userType;

    let query;
    if (userType === 'aluno') {
        query = 'SELECT t.* FROM turmas t INNER JOIN turma_alunos ta ON t.id = ta.turma_id WHERE ta.aluno_id = ?';
    } else if (userType === 'professor') {
        query = 'SELECT * FROM turmas WHERE professor_id = ?';
    } else {
        return res.status(400).json({ message: 'Tipo de usuário inválido' });
    }

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Erro ao consultar turmas:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
        }

        res.status(200).json({ turmas: results });
    });
});

router.get('/turma/:turmaId/listas', (req, res) => {
  
  const turmaId = req.params.turmaId;
  const query = 'SELECT * FROM listas as  l join turma_listas as tl on l.id = tl.lista_id WHERE turma_id = ?';
   
  db.query(query, [turmaId], (err, results) => {
      if (err) {
          console.error('Erro ao consultar listaaas da turma:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      res.status(200).json({ listas: results });
  });
});

router.get('/turma/:turmaId/ListarAlunos', (req, res) => {

  const turmaId = req.params.turmaId;  
  if (!turmaId) {
    console.error('ID da turma não fornecido');
    return res.status(400).json({ message: 'ID da turma é obrigatório' });
  }
  
  const query = `
      SELECT a.* FROM alunos a
      INNER JOIN turma_alunos ta ON a.id = ta.aluno_id
      WHERE ta.turma_id = ?
  `;
  
  db.query(query, [turmaId], (err, results) => {
      if (err) {
          console.error('Erro ao consultar alunos da turma:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      res.status(200).json({ alunos: results });
  });
});

router.post('/turmas/criar-turma', criarTurma);

router.get('/professor/turma/:turmaId/tags', getTags);



export default router;