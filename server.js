const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Aumenta o limite para 50mb (ajuste conforme necessário)
app.use(bodyParser.json({ limit: '50mb' })); // Para requisições JSON
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // Para requisições urlencoded
app.use(cors());

// Caminho do arquivo JSON
const dataFilePath = path.join(__dirname, 'alunos.json');

// Função para ler os dados do arquivo
const readDataFromFile = () => {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        try {
            return JSON.parse(data);  // Lê e faz o parse do JSON
        } catch (err) {
            console.error('Erro ao ler o arquivo JSON:', err);
            return { aluno: [], Adm: [] };  // Retorna um JSON vazio caso ocorra erro
        }
    }
    return { aluno: [], Adm: [] };  // Caso o arquivo não exista
};

// Função para escrever os dados no arquivo
const writeDataToFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Inicializa os dados de alunos e administradores
let { aluno: alunos, Adm } = readDataFromFile();
let nextId = alunos.length > 0 ? alunos[alunos.length - 1].id + 1 : 1;  // Define o próximo ID baseado no último aluno

app.get('/', (req, res) => {
    res.send('Olá! Esta é a página inicial.');
});

// Rota POST para adicionar novo aluno
app.post('/alunos', (req, res) => {
    const { nome, dataNascimento, unidade, rg, fotoAluno, qrCode } = req.body;

    const newAluno = {
        id: nextId++,              
        nome,
        dataNascimento,
        unidade,
        rg,
        'img-aluno': fotoAluno,  // Aqui o campo 'img-aluno' recebe o valor da imagem
        'qr-code': qrCode
    };

    alunos.push(newAluno);
    writeDataToFile({ aluno: alunos, Adm });  // Salva os dados, incluindo a imagem

    res.status(201).json(newAluno);
});

// Rota GET para obter todos os alunos
app.get('/alunos', (req, res) => {
    res.json({ aluno: alunos, Adm }); // Retorna os alunos e administradores
});

// Rota DELETE para excluir um aluno pelo RG
app.delete('/alunos/:rg', (req, res) => {
    const rg = req.params.rg;

    // Busca o índice do aluno com o RG informado
    const alunoIndex = alunos.findIndex(aluno => aluno.rg === rg);

    if (alunoIndex !== -1) {
        // Remove o aluno da lista
        const deletedAluno = alunos.splice(alunoIndex, 1);

        // Atualiza o arquivo JSON
        writeDataToFile({ aluno: alunos, Adm });

        // Retorna uma resposta de sucesso
        res.status(200).json({
            message: 'Aluno excluído com sucesso',
            aluno: deletedAluno
        });
    } else {
        // Se o aluno não for encontrado, retorna um erro
        res.status(404).json({ message: 'Aluno não encontrado' });
    }
});

//Rota PUT para atualizar o json
app.put('/alunos/:rg', (req, res) => {
    const rg = req.params.rg;
    const { nome, dataNascimento, unidade, fotoAluno } = req.body;

    // Busca o índice do aluno pelo RG
    const alunoIndex = alunos.findIndex(aluno => aluno.rg === rg);

    if (alunoIndex !== -1) {
        // Atualiza os dados do aluno
        alunos[alunoIndex] = {
            ...alunos[alunoIndex], // Mantém os dados antigos
            nome,
            dataNascimento,
            unidade,
            'img-aluno': fotoAluno // Atualiza a imagem
        };

        // Salva os dados atualizados no arquivo JSON
        writeDataToFile({ aluno: alunos, Adm });

        // Responde com sucesso e os dados atualizados
        res.status(200).json({
            message: 'Aluno atualizado com sucesso',
            aluno: alunos[alunoIndex]
        });
    } else {
        res.status(404).json({ message: 'Aluno não encontrado' });
    }
});

// Inicializa o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/alunos`);
});
