//Gerar o qr code na outra caixa
const wrapper = document.querySelector(".wrapper"),
    qrInput = wrapper.querySelector(".form input"),
    generateBtn = document.querySelector("#generate-qr"),
    qrImg = document.querySelector(".caixa2 .qr-code img"); // Atualiza a referência da imagem para a caixa2

generateBtn.addEventListener("click", () => {
    let qrValue = qrInput.value;
    if (!qrValue) return;

    qrValue = '00000000000' + qrValue;

    generateBtn.innerText = "Gerando um Qr Code...";
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=${qrValue}`;
    qrImg.addEventListener("load", () => {
        generateBtn.innerText = "Gerar Qr Code";
        document.querySelector(".caixa2").classList.add("active"); // Adiciona classe se necessário
    });

});

qrInput.addEventListener("keyup", () => {
    if (!qrInput.value) {
        document.querySelector(".caixa2").classList.remove("active"); // Remove classe se necessário
    }
});

document.getElementById('imagem').addEventListener('change', function(event) {
    const arquivo = event.target.files[0];
    const container = document.getElementById('imagem-container');
    const caixa2Img = document.getElementById('caixa2-img');
    
    container.innerHTML = ''; // Limpa o container

    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '300px'; // Limita a largura da imagem
            container.appendChild(img);

            // Atualiza a imagem na caixa2
            caixa2Img.src = e.target.result;
        }
        leitor.readAsDataURL(arquivo);
    }
});

//qr code ********************************************************************************


// Função para copiar o valor das caixas de texto para a caixa2
function copiarTexto() {
    var input = document.getElementById('nome1');
    input.value = input.value.toUpperCase();
    document.getElementById('nome2').value = document.getElementById('nome1').value;
    document.getElementById('data2').value = document.getElementById('data1').value;
    document.getElementById('nrg2').value = document.getElementById('nrg1').value;
    document.getElementById('uni2').value = document.getElementById('uni1').value;
    document.getElementById('matricula2').value = document.getElementById('matricula1').value;
}

function transformarMaiusculas() {
    // Obtém o elemento input pelo id
    var input = document.getElementById('nome-login');
    // Converte o valor para maiúsculas
    input.value = input.value.toUpperCase();
}


function formatarRG() {
    // Seleciona os dois campos de entrada
    const rgInputs = document.querySelectorAll('#nrg1, #rg-login,#txtBusca');

    rgInputs.forEach(input => {
        let valor = input.value;

        // Remove caracteres não numéricos
        valor = valor.replace(/\D/g, '');

        // Aplica a formatação
        if (valor.length > 2) {
            valor = valor.slice(0, 2) + '.' + valor.slice(2);
        }
        if (valor.length > 6) {
            valor = valor.slice(0, 6) + '.' + valor.slice(6);
        }
        if (valor.length > 10) {
            valor = valor.slice(0, 10) + '-' + valor.slice(10);
        }

        input.value = valor;
    });
}

// Adiciona o evento de input para validação e formatação do RG
document.getElementById('nrg1').addEventListener('input', formatarRG);

 
//CSS Alert
document.addEventListener('DOMContentLoaded', function() {
    // Colocando o event listener no botão para chamar a função AlertsTop ao clicar
    document.getElementById('enviar').addEventListener('click', function(event) {
        event.preventDefault(); // Prevenindo o envio automático do formulário
        AlertsTop(); // Realizando a validação
    });

    // Função AlertsTop que será executada ao clicar no botão
    function AlertsTop() {
        salvaCartao(); 
        buscarExibirAluno(); 
        BuscaAluno2(); 
        Atualizar(); 
        Excluir(); 
        BuscaAluno3(); 
    }
});
//Fim CSS Alert

// Função para salvar o aluno
function salvaCartao() {
    const nome = document.getElementById('nome2').value;
    const dataNascimento = document.getElementById('data2').value;
    const unidade = document.getElementById('uni2').value;
    const rg = document.getElementById('nrg2').value;
    const fotoAluno = document.getElementById('caixa2-img').src;
    const qrCode = document.querySelector('.caixa2 .qr-code img').src;

    // Verifica se todos os campos estão preenchidos
    if (!nome || !dataNascimento || !unidade || !fotoAluno || !qrCode) {
        Swal.fire({
            title: 'Atenção',
            text: 'Por favor, preencha todos os campos e gere o QR Code.',
            icon: 'warning',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        });
        return;
    }

    // Faz uma requisição GET para buscar todos os alunos e verificar se o RG já existe
    fetch('http://localhost:3000/alunos')
        .then(response => response.json())
        .then(data => {
            const alunos = data.aluno; // Supondo que os alunos estão no campo "aluno" do JSON

            // Verifica se o RG já existe
            const rgExistente = alunos.some(aluno => aluno.rg === rg);

            if (rgExistente) {
                Swal.fire({
                    title: 'Erro',
                    text: 'O RG informado já está cadastrado. Por favor, insira um RG diferente.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                });
                return;
            }

            // Se o RG não existir, prossegue com o cadastro
            Swal.fire({
                title: 'Sucesso',
                text: 'Aluno cadastrado com sucesso!',
                icon: 'success',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
            }).then(() => {
                return fetch('http://localhost:3000/alunos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome,
                        dataNascimento,
                        unidade,
                        rg,
                        fotoAluno,
                        qrCode
                    })
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao salvar o aluno.');
                }
                return response.json();
            })
            .then(data => {
                const aluno = {
                    nome,
                    dataNascimento,
                    unidade,
                    rg,
                    fotoAluno,
                    qrCode
                };
                localStorage.setItem('aluno', JSON.stringify(aluno));
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Algo deu errado!',
                });
            });
        });
}

// Função para buscar e exibir os dados do aluno que fez o login
function buscarExibirAluno() {
    const nomeLogin = document.getElementById('nome-login').value.trim();
    const rgLogin = document.getElementById('rg-login').value.trim();

    if (!nomeLogin || !rgLogin) {
        Swal.fire({
            title: 'Atenção',
            text: 'Por favor, preencha todos os campos e gere o QR Code.',
            icon: 'warning',
            confirmButtonText: 'OK', // Adiciona o botão de confirmação
            allowOutsideClick: false, // Previne que o alerta feche clicando fora
        });
        return;
    }

    fetch('http://localhost:3000/alunos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar alunos');
            }
            return response.json();
        })
        .then(data => {
            // Busca o aluno correspondente
            const alunoEncontrado = data.aluno.find(aluno => aluno.nome === nomeLogin && aluno.rg === rgLogin);
            const admin = data.Adm.find(adm => adm.adm === nomeLogin && adm.senha === rgLogin);

            if (admin) {
                // Redireciona para a página de administração
                window.location.href = 'PaginaDesktop.html';
            } else if (alunoEncontrado) {
                // Armazena os dados do aluno no localStorage
                localStorage.setItem('aluno', JSON.stringify({
                    nome: alunoEncontrado.nome,
                    dataNascimento: alunoEncontrado.dataNascimento,
                    unidade: alunoEncontrado.unidade,
                    rg: alunoEncontrado.rg,
                    fotoAluno: alunoEncontrado['img-aluno'], // Armazenar a foto do aluno
                    qrCode: alunoEncontrado['qr-code']      // Armazenar o QR Code
                }));

                // Redireciona para a página carterinha.html
                window.location.href = 'carterinha.html';
            } else {
                Swal.fire({
                    title: 'Erro',
                    text: 'Nome ou RG invalidos.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                });

            }
        })
        .catch(error => {
            Swal.fire('Erro', 'Ocorreu um erro ao realizar o login.', 'error');
        });
}


// Função para buscar aluno
function BuscaAluno3() {

    const rgDigitado = document.getElementById('txtBusca').value;
    
    fetch('/alunos.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo JSON');
            }
            return response.json();
        })
        .then(data => {
            const alunos = data.aluno;
            const alunoEncontrado = alunos.find(aluno => aluno.rg === rgDigitado);
            
            if (alunoEncontrado) {
                // Preenche as caixas com os dados do aluno encontrado
                document.getElementById('nome1').value = alunoEncontrado.nome;
                document.getElementById('data1').value = alunoEncontrado.dataNascimento;
                document.getElementById('uni1').value = alunoEncontrado.unidade;
                document.getElementById('nrg1').value = alunoEncontrado.rg;
                document.getElementById('imagem-aluno').src = alunoEncontrado['img-aluno'];

                // Exibe o card com os detalhes do aluno
                document.getElementById('cardAluno').style.display = 'block'; 

                // Preenche o campo de RG no card
                preencherCarteirinha(alunoEncontrado); 
            } else {
                Swal.fire({
                    title: 'Erro',
                    text: 'Aluno não encontrado',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                });

                document.getElementById('cardAluno').style.display = 'none'; // Esconde o card se o aluno não for encontrado
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os alunos:', error);
        });
}


function BuscaAluno2() {
    const rgDigitado = document.getElementById('txtBusca').value;
    
    fetch('/alunos.json')  
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar o arquivo JSON');
            }
            return response.json();
        })
        .then(data => {
            const alunos = data.aluno;
            const alunoEncontrado = alunos.find(aluno => aluno.rg === rgDigitado);
            
            if (alunoEncontrado) {
                preencherCarteirinha(alunoEncontrado);
                document.getElementById('cardAluno').style.display = 'block';
            } else {
                Swal.fire({
                    title: 'Erro',
                    text: 'Aluno não encontrado',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                });

                document.getElementById('cardAluno').style.display = 'none';
            }
        })
}



function Excluir() {
    const rgDigitado = document.getElementById('txtBusca').value;

    if (!rgDigitado) {
        Swal.fire({
            title: 'Atenção',
            text: 'Digite o RG do aluno que quer excluir',
            icon: 'warning',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
        });
        return;
    }

    // Alerta de confirmação antes de excluir
    Swal.fire({
        title: 'Sucesso',
        text: 'Aluno deletado com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`http://localhost:3000/alunos/${rgDigitado}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao excluir aluno');
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    title: 'Sucesso',
                    text: 'Aluno excluído com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                });
            })
            .catch(error => {
                console.error('Erro ao excluir aluno:', error);
                Swal.fire({
                    title: 'Erro',
                    text: 'Erro ao excluir aluno.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            });
        }
    });
}

// Função para atualizar os dados
function Atualizar() {
    const nome = document.getElementById('nome1').value;
    const dataNascimento = document.getElementById('data1').value;
    const unidade = document.getElementById('uni1').value;
    const rg = document.getElementById('nrg1').value;
    const fotoInput = document.getElementById('imagem');

    if (!nome || !dataNascimento || !unidade || !rg) {
        Swal.fire('Atenção', 'Por favor, preencha todos os campos.', 'warning');
        return;
    }

    // Alerta de confirmação antes de atualizar
    Swal.fire({
        title: 'Sucesso',
        text: 'Aluno atulazido com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
            const enviarDadosAtualizados = (fotoAluno) => {
                fetch(`http://localhost:3000/alunos/${rg}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome,
                        dataNascimento,
                        unidade,
                        fotoAluno
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Aluno atualizado com sucesso') {

                    } else {
                        Swal.fire('Erro', data.message || 'Erro ao atualizar aluno.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Erro ao atualizar aluno:', error);
                    Swal.fire({
                        title: 'Erro',
                        text: 'Erro ao atualizar o aluno',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                    });
                });
            };

            if (fotoInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const novaFotoBase64 = e.target.result;
                    enviarDadosAtualizados(novaFotoBase64); // Envia os dados com a nova imagem
                };
                reader.readAsDataURL(fotoInput.files[0]);
            } else {
                const fotoAtual = document.getElementById('imagem-aluno').src;
                enviarDadosAtualizados(fotoAtual); // Envia os dados com a imagem existente
            }
        }
    });
}