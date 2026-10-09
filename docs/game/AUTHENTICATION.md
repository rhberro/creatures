# Autenticação

Este documento cobre todo o processo de autenticação, desde a criação de contas até o acesso à conta e a administração dos treinadores.

> Um **treinador** é o personagem do jogador dentro do jogo, com nome, gênero e avatar. Cada conta pode ter no máximo 5 treinadores.

## Rotas

| Rota | Tela | Acesso |
| --- | --- | --- |
| `/login` | [Tela de login](#tela-de-login) | Pública |
| `/signup` | [Tela de cadastro](#tela-de-cadastro) | Pública |
| `/forgot-password` | [Tela de esquecimento de senha](#tela-de-esquecimento-de-senha) | Pública |
| `/reset-password` | [Tela de redefinir senha](#tela-de-redefinir-senha) | Pública |
| `/terms` | [Tela de termos de serviço](#tela-de-termos-de-serviço) | Pública |
| `/privacy` | [Tela de política de privacidade](#tela-de-política-de-privacidade) | Pública |
| `/trainers` | [Tela de lista de treinadores](#tela-de-lista-de-treinadores) | Protegida |
| `/trainers/new` | [Tela de criar treinador](#tela-de-criar-treinador) | Protegida |
| `/game` | [Tela do jogo](#tela-do-jogo) | Protegida |

## Escopo das Fases Alfa e Beta

Para as fases alfa e beta vamos manter o cadastro simples e rápido. Os pontos abaixo são temporários e devem ser revistos antes da abertura ao público:

- Não há confirmação de e-mail no cadastro.
- Os termos de serviço e a política de privacidade são apenas placeholders.
- Ao tentar se cadastrar com um e-mail já existente, o usuário é redirecionado para a tela de login, o que revela que o e-mail está cadastrado.

## Controle de Acesso

As telas de login, cadastro, termos de serviço, política de privacidade e recuperação de senha são públicas. Todas as demais telas são protegidas e exigem uma sessão autenticada. Ao acessar uma tela protegida sem autenticação, o usuário é simplesmente redirecionado para a [tela de login](#tela-de-login).

Usuários já autenticados que acessarem as telas de login, cadastro, esquecimento de senha ou redefinição de senha são redirecionados conforme o [controle de redirecionamento](#controle-de-redirecionamento). As telas de termos de serviço e política de privacidade continuam acessíveis para todos.

### Sessão

A sessão expira após 7 dias sem atividade. Ao expirar, o usuário é redirecionado para a [tela de login](#tela-de-login) no próximo acesso a uma tela protegida.

A opção "Sair" fica disponível na [tela de lista de treinadores](#tela-de-lista-de-treinadores) e na [tela do jogo](#tela-do-jogo), e ao clicar encerra a sessão e redireciona o usuário para a [tela de login](#tela-de-login).

### Proteção Contra Tentativas Excessivas

Para evitar abuso, os seguintes limites se aplicam:

- **Login:** após 5 tentativas falhas em 15 minutos para o mesmo e-mail ou o mesmo IP, novas tentativas são bloqueadas temporariamente com a mensagem "Muitas tentativas. Tente novamente em alguns minutos.".
- **Envio de e-mail de recuperação:** máximo de 1 envio por minuto e 5 por hora para o mesmo e-mail. Ao exceder o limite, nenhum e-mail é enviado, mas o alerta exibido ao usuário continua sendo o mesmo, para não revelar nada sobre o e-mail.

## Controle de Redirecionamento

Após qualquer autenticação bem-sucedida (por e-mail e senha ou via Google), o usuário é redirecionado conforme o estado da conta: Se a conta ainda não possui nenhum treinador, vai para a [tela de criar treinador](#tela-de-criar-treinador); Se a conta já possui treinadores, vai para a [tela de lista de treinadores](#tela-de-lista-de-treinadores).

## Regras de Senha

As regras abaixo valem para o cadastro e para a redefinição de senha:

- Mínimo de 8 e máximo de 64 caracteres, sem exigência de complexidade.
- Se a senha for menor que o mínimo, exibimos "A senha deve ter no mínimo 8 caracteres.".
- Se a senha e a confirmação forem diferentes, exibimos "As senhas não conferem.".

## Tela de Login

A tela de acesso ao jogo, um formulário simples com duas opções de login, utilizando e-mail e senha ou autenticação via Google. Uma vez autenticado o usuário é redirecionado conforme o [controle de redirecionamento](#controle-de-redirecionamento).

Se o e-mail ou a senha estiverem incorretos, exibimos sempre a mesma mensagem genérica "E-mail ou senha inválidos.", sem indicar qual dos dois está errado. A mesma mensagem é exibida quando o e-mail pertence a uma conta criada exclusivamente via Google, que não possui senha.

> Ao optar por autenticação via Google e o usuário ainda não for cadastrado no jogo, uma conta é criada automaticamente e o login é realizado. Caso a conta já exista, fazemos o merge da conta Google com a conta existente, sem criar contas duplicadas, e o usuário passa a ter acesso à conta pelos dois métodos, Google ou e-mail e senha.

> O merge só é realizado se o Google informar que o e-mail está verificado. Como o cadastro por e-mail e senha não exige confirmação de e-mail, uma conta existente pode ter sido criada por outra pessoa com o e-mail do usuário. Por isso, ao realizar o merge, a senha previamente cadastrada na conta é descartada e todas as sessões existentes são encerradas. Se quiser continuar acessando por e-mail e senha, o usuário define uma nova senha pelo fluxo de [recuperação de senha](#recuperação-de-senha).

Nessa tela também vamos exibir a opção de lembrar o e-mail (mas não a senha), e uma opção para os usuários que esqueceram a senha, levando até o fluxo de [recuperação de senha](#recuperação-de-senha).

Na parte inferior da página, devemos exibir a seguinte frase "Ao continuar, você concorda com os [Termos de Serviço](/terms) e a [Política de Privacidade](/privacy) do Creatures.". Ambos os links devem redirecionar o usuário para os [termos de serviço](#tela-de-termos-de-serviço) e a [política de privacidade](#tela-de-política-de-privacidade) respectivamente.

## Tela de Cadastro

A tela responsável pela criação de novas contas, por enquanto é um formulário simples com os campos e-mail, senha e confirmar senha, seguindo as [regras de senha](#regras-de-senha). Na parte inferior vamos exibir dois botões, um para concluir o cadastro e um para fazer o registro via Google.

> Ao realizar o cadastro com sucesso, vamos redirecionar o usuário já autenticado conforme o [controle de redirecionamento](#controle-de-redirecionamento). Se o e-mail informado já estiver cadastrado, redirecionamos o usuário para a [tela de login](#tela-de-login).

> Ao realizar o registro via Google em uma conta já existente, fazemos o merge conforme descrito na [tela de login](#tela-de-login), sem criar contas duplicadas nem informações desnecessárias.

Nesse primeiro momento não é necessário confirmação de e-mail, conforme o [escopo das fases alfa e beta](#escopo-das-fases-alfa-e-beta).

## Termos de Serviço e Política de Privacidade

Como a [tela de login](#tela-de-login) exibe um aceite formal ao continuar, ambos os documentos precisam estar escritos e publicados antes da abertura do jogo ao público, em conformidade com a LGPD.

### Tela de Termos de Serviço

Por hora uma tela com um placeholder simples, sem muita informação, iremos exibir, quando disponível, os termos de serviço.

### Tela de Política de Privacidade

Assim como a [tela de termos](#tela-de-termos-de-serviço), iremos exibir um placeholder pois ainda não temos a política de privacidade escrita.

## Recuperação de Senha

O processo para recuperar senha é feito a partir de um "link mágico" enviado no e-mail se o mesmo existir em nossa base de dados. Contas criadas exclusivamente via Google nunca tiveram senha e, portanto, não suportam esse fluxo: o e-mail é tratado como não encontrado. Contas criadas por e-mail e senha suportam o fluxo mesmo após o merge com o Google.

### Tela de Esquecimento de Senha

Uma tela que exibe um formulário simples com um campo e-mail e um botão "Enviar e-mail de recuperação". Quando o e-mail for preenchido e o botão pressionado, exibiremos um alerta para o usuário com a mensagem "Se o e-mail existir em nossa base de dados, enviamos um link de recuperação.".

> O alerta deve ser enviado sempre que o formulário for preenchido corretamente (e-mail no formato correto, apenas o formato) e o botão pressionado, mesmo que o e-mail não exista na nossa base de dados, e isso faz parte do processo, dessa forma, não revelamos se o e-mail está ou não cadastrado.

### Tela de Redefinir Senha

O acesso a essa tela é feito a partir de um link de recuperação de senha enviado no e-mail do usuário, contém um token de uso único e com expiração de 30 minutos para maior segurança. A tela exibe um formulário simples com os campos senha e confirmar senha, seguindo as [regras de senha](#regras-de-senha), seguido de um botão "Redefinir senha" que ao clicar finaliza o processo de redefinição de senha.

Ao redefinir a senha com sucesso, todas as sessões existentes da conta são encerradas e redirecionamos o usuário para a [tela de login](#tela-de-login), que exibe um alerta com a mensagem "Senha redefinida com sucesso. Faça login para continuar.". Caso ocorra um erro, exibimos um alerta na mesma página para que o usuário tente outra vez.

> O token disponível no link deve fazer parte do formulário como um campo escondido ("hidden"), para ser enviado junto com a requisição, é o que garante a segurança e autenticidade do processo. Uma vez utilizado, o token fica inválido e não pode mais ser utilizado. Se o token estiver inválido, expirado ou já tiver sido utilizado, exibimos na mesma página o alerta "Este link de recuperação é inválido, expirou ou já foi utilizado. Solicite um novo link.", com um link para a [tela de esquecimento de senha](#tela-de-esquecimento-de-senha).

## Tela de Lista de Treinadores

Tela simples com um título e uma lista de cards na horizontal com no máximo 5 cards, onde slots em vazio são exibidos com cards vazios e um ícone de "mais" no centro, que, ao clicar, redireciona o usuário para a [tela de criar treinador](#tela-de-criar-treinador). Cada card de treinador exibe o avatar e o nome do treinador. Na parte inferior da lista, vamos exibir dois botões, que, quando um treinador for selecionado vão ser habilitados, são eles "Entrar" e "Remover". Também vamos exibir a opção "Sair", conforme descrito na [sessão](#sessão).

Ao clicar em um card, o treinador é selecionado e o card ganha um destaque visual na borda. Clicar novamente no card selecionado remove a seleção, e os botões "Entrar" e "Remover" voltam a ficar desabilitados.

> Ao clicar em "Remover", um diálogo de confirmação deve ser exibido para o usuário, evitando exclusões errôneas. A confirmação deve deixar explícito que a remoção é definitiva: itens, criaturas e todo o progresso do treinador são perdidos.

Com um treinador selecionado, ao clicar no botão "Entrar" o usuário é redirecionado para a [tela do jogo](#tela-do-jogo) onde pode começar a jogar.

> Ao remover um treinador, todos os dados vinculados a ele, incluindo itens e criaturas, são apagados do banco de dados, como se o treinador nunca tivesse sido criado. A conta em si continua existindo. Se o último treinador for removido, o usuário permanece na tela com os 5 slots vazios, sem redirecionamento automático.

## Tela de Criar Treinador

Tela com um formulário simples para criação de treinador, vamos exibir um avatar no lado esquerdo que muda de acordo com o gênero selecionado, já na parte direita exibiremos um formulário com dois campos: nome, que deve ser único e verificado assim que o usuário der "blur" no campo, exibindo as mensagens "Nome disponível" ou "Nome indisponível" que são autodescritivas, e gênero, que o usuário seleciona entre as opções Masculino e Feminino, sendo Masculino a opção selecionada por padrão. Na parte inferior vamos exibir dois botões, "Criar" e "Voltar". O botão "Criar" fica habilitado somente quando o nome está válido e disponível, já o botão "Voltar" está sempre habilitado.

> O nome deve ter entre 3 e 15 caracteres e conter apenas letras (com ou sem acento), números, espaços, traços e underscores, nada mais do que isso. Espaços no início ou no fim são removidos, e espaços consecutivos não são permitidos. A validação deve apontar o erro de caractere com a mensagem "Apenas caracteres simples, espaços, traços e underscores são permitidos." e o erro de tamanho com a mensagem "O nome deve ter entre 3 e 20 caracteres.".

> O nome é único em todo o jogo, e a comparação ignora diferenças de maiúsculas, minúsculas e acentos, ou seja, "Ana", "ana" e "Aná" são considerados o mesmo nome.

> Como o nome pode ser ocupado por outro jogador entre o "blur" e o clique em "Criar", o servidor deve validar o nome novamente no momento da criação. Se o nome não estiver mais disponível, o treinador não é criado, o usuário permanece na tela e exibimos a mensagem "Nome indisponível".

Ao clicar em criar, o treinador é criado e o usuário é redirecionado para a [tela de lista de treinadores](#tela-de-lista-de-treinadores).

Cada conta pode ter no máximo 5 treinadores, limite que também deve ser imposto pelo servidor. Se a conta já tiver 5 treinadores, ao acessar essa tela o usuário é redirecionado para a [tela de lista de treinadores](#tela-de-lista-de-treinadores), que exibe um alerta com a mensagem "Você atingiu o limite de 5 treinadores.".

Ao clicar em voltar, o usuário é redirecionado de volta para a [tela de lista de treinadores](#tela-de-lista-de-treinadores).
