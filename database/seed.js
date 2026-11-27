const { get, run } = require('./db');

const contasFixas = [
    // ==========================
    //      ADMINISTRADORES
    // ==========================
    {
        tipo: 'adm',
        email: 'admin.ana@fixly.com',
        senha: '123',
        nome: 'Ana Luiza',
        cpf: '111.111.111-11',
        nascimento: '2009-30-08',
        telefone: '(11) 99999-0001',
        cep: '07000-000',
        endereco: 'Av. Paulo Faccini, 100 - Guarulhos/SP'
    },
    {
        tipo: 'adm',
        email: 'admin.any@fixly.com',
        senha: '123',
        nome: 'Any',
        cpf: '111.111.111-22',
        nascimento: '2009-07-31',
        telefone: '(11) 99999-0002',
        cep: '07000-000',
        endereco: 'Av. Paulo Faccini, 100 - Guarulhos/SP'
    },
    {
        tipo: 'adm',
        email: 'admin.luana@fixly.com',
        senha: '123',
        nome: 'Luana',
        cpf: '111.111.111-33',
        nascimento: '2009-07-29',
        telefone: '(11) 99999-0003',
        cep: '07000-000',
        endereco: 'Av. Paulo Faccini, 100 - Guarulhos/SP'
    },
    {
        tipo: 'adm',
        email: 'admin.brayan@fixly.com',
        senha: '123',
        nome: 'Brayan',
        cpf: '111.111.111-44',
        nascimento: '2010-04-10',
        telefone: '(11) 99999-0004',
        cep: '07000-000',
        endereco: 'Av. Paulo Faccini, 100 - Guarulhos/SP'
    },

    // ==========================
    //   PROFISSIONAIS / TÉCNICOS
    // ==========================
    {
        tipo: 'profissional',
        email: 'tecnico@fixly.com',
        senha: '123',
        nome: 'Carlos Silva',
        cpf: '222.222.222-22',
        nascimento: '1995-05-20',
        telefone: '(11) 99999-0005',
        cep: '07110-000',
        cargo: 'Técnico em Hardware e Redes',
        admissao: '2024-02-01'
    },
    {
        tipo: 'profissional',
        email: 'mariana.tec@fixly.com',
        senha: '123',
        nome: 'Mariana Costa',
        cpf: '222.333.444-55',
        nascimento: '1993-09-12',
        telefone: '(11) 99999-0006',
        cep: '07090-010',
        cargo: 'Especialista em Redes e Servidores',
        admissao: '2024-04-15'
    },
    {
        tipo: 'profissional',
        email: 'rafael.tec@fixly.com',
        senha: '123',
        nome: 'Rafael Oliveira',
        cpf: '222.555.666-77',
        nascimento: '1997-11-03',
        telefone: '(11) 99999-0007',
        cep: '07130-200',
        cargo: 'Técnico em Smartphones e Periféricos',
        admissao: '2025-01-10'
    },

    // ==========================
    //         CLIENTES
    // ==========================
    {
        tipo: 'cliente',
        email: 'cliente@fixly.com',
        senha: '123',
        nome: 'Pedro Paulo',
        cpf: '333.333.333-33',
        nascimento: '2000-08-15',
        telefone: '(11) 99999-0008',
        cep: '07120-000',
        endereco: 'Rua Dom Pedro II, 250 - Guarulhos/SP'
    },
    {
        tipo: 'cliente',
        email: 'lucas.mendes@fixly.com',
        senha: '123',
        nome: 'Lucas Mendes',
        cpf: '444.444.444-44',
        nascimento: '1998-03-22',
        telefone: '(11) 98888-1122',
        cep: '07050-120',
        endereco: 'Rua Sete de Setembro, 410 - Guarulhos/SP'
    }
];

const garantirColunasOs = async () => {
    const colunasExtras = [
        'diagnostico TEXT',
        'servico_executado TEXT',
        'data_finalizacao TEXT',
        'preco_mao_obra REAL',
        'preco_material REAL',
        'validacao_cliente TEXT',
        'valor REAL',
        'valorfinal REAL',
        'status TEXT',
        'idTecnico INTEGER',
        'tecnico TEXT'
    ];

    for (const colDef of colunasExtras) {
        try {
            await run(`ALTER TABLE os ADD COLUMN ${colDef}`);
        } catch (_) {
            // Coluna já existe
        }
    }
};

const popularContasPadrao = async () => {
    for (const conta of contasFixas) {
        const existente = await get('SELECT * FROM login WHERE email = ?', [conta.email]);
        if (existente) continue;

        const resLogin = await run(
            'INSERT INTO login (email, senha, tipo) VALUES (?, ?, ?)',
            [conta.email, conta.senha, conta.tipo]
        );

        if (conta.tipo === 'profissional') {
            await run(
                `INSERT INTO tecnicos (nome, cpf, dataNascimento, telefone, email, cep, admissao, cargo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [conta.nome, conta.cpf, conta.nascimento, conta.telefone, conta.email, conta.cep, conta.admissao, conta.cargo]
            );
        } else {
            await run(
                `INSERT INTO usuarios (idCliente, nome, cpf, dataNascimento, telefone, email, cep, endereco, cadastro_completo)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                [resLogin.id, conta.nome, conta.cpf, conta.nascimento, conta.telefone, conta.email, conta.cep, conta.endereco]
            );
        }
    }

    // Popula ordens de serviço de demonstração apenas se a tabela "os" estiver vazia
    const totalOs = await get('SELECT COUNT(*) AS total FROM os');
    if (totalOs && totalOs.total > 0) {
        console.log('Contas fixas e ordens de serviço de apresentação verificadas/prontas!');
        return;
    }

    await garantirColunasOs();

    const cliPedro = await get("SELECT idCliente FROM login WHERE email = 'cliente@fixly.com'");
    const cliLucas = await get("SELECT idCliente FROM login WHERE email = 'lucas.mendes@fixly.com'");

    const tecCarlos = await get("SELECT idTecnico, nome FROM tecnicos WHERE email = 'tecnico@fixly.com'");
    const tecMariana = await get("SELECT idTecnico, nome FROM tecnicos WHERE email = 'mariana.tec@fixly.com'");
    const tecRafael = await get("SELECT idTecnico, nome FROM tecnicos WHERE email = 'rafael.tec@fixly.com'");

    const ordensExemplo = [
        // 1. ABERTA / PENDENTE (Sem técnico — disponível para assumir ou atribuir pelo ADM)
        {
            abertura: '27/11/2026',
            hora: '09:15:00',
            equipamento: 'Notebook Dell Inspiron 15',
            marca: 'Dell',
            perifericos: 'Carregador original e mouse sem fio',
            descricao: 'Notebook desligando sozinho após 10 minutos de uso e aquecendo muito.',
            processo: 'Pendente',
            status: 'aberta',
            idCliente: cliPedro?.idCliente,
            idTecnico: null,
            tecnico: null,
            diagnostico: '',
            servico_executado: '',
            data_finalizacao: '',
            preco_mao_obra: 0,
            preco_material: 0,
            valor: 0,
            valorfinal: 0,
            validacao_cliente: null
        },

        // 2. EM ANÁLISE — AGUARDANDO APROVAÇÃO DO CLIENTE (Pedro Paulo)
        {
            abertura: '25/11/2026',
            hora: '14:30:00',
            equipamento: 'PC Gamer Desktop',
            marca: 'Custom / Asus',
            perifericos: 'Apenas gabinete',
            descricao: 'Computador liga os coolers mas não dá vídeo no monitor.',
            processo: 'Em análise',
            status: 'analise',
            idCliente: cliPedro?.idCliente,
            idTecnico: tecCarlos?.idTecnico,
            tecnico: tecCarlos?.nome,
            diagnostico: 'Fonte de alimentação com tensão instável na linha 12V e oxidação nos contatos da memória RAM.',
            servico_executado: 'Substituição da fonte 600W 80 Plus e limpeza química dos slots de memória.',
            data_finalizacao: '29/11/2026',
            preco_mao_obra: 120.00,
            preco_material: 340.00,
            valor: 520.00,
            valorfinal: 520.00,
            validacao_cliente: 'pendente'
        },

        // 3. EM ANDAMENTO
        {
            abertura: '24/11/2026',
            hora: '11:05:00',
            equipamento: 'Roteador Mesh Wi-Fi 6 + Switch 8 Portas',
            marca: 'TP-Link',
            perifericos: '2 fontes de alimentação e cabos patch cord',
            descricao: 'Queda constante de conexão na rede do escritório e perda de pacotes.',
            processo: 'Em andamento',
            status: 'andamento',
            idCliente: cliLucas?.idCliente,
            idTecnico: tecMariana?.idTecnico,
            tecnico: tecMariana?.nome,
            diagnostico: 'Firmware desatualizado gerando conflito de DHCP e porta WAN com mau contato.',
            servico_executado: 'Reconfiguração completa da topologia Mesh, atualização de firmware e troca de conectores RJ45.',
            data_finalizacao: '28/11/2026',
            preco_mao_obra: 180.00,
            preco_material: 45.00,
            valor: 285.00,
            valorfinal: 285.00,
            validacao_cliente: 'aprovado'
        },

        // 4. CONGELADA / PAUSADA
        {
            abertura: '21/11/2026',
            hora: '16:40:00',
            equipamento: 'iPhone 13 Pro',
            marca: 'Apple',
            perifericos: 'Sem acessórios',
            descricao: 'Tela trincada após queda e touch falhando na parte superior.',
            processo: 'Congelada',
            status: 'congelada',
            idCliente: cliPedro?.idCliente,
            idTecnico: tecRafael?.idTecnico,
            tecnico: tecRafael?.nome,
            diagnostico: 'Display OLED danificado; placa lógica intacta.',
            servico_executado: 'Aguardando chegada da tela frontal original do fornecedor.',
            data_finalizacao: '02/12/2026',
            preco_mao_obra: 150.00,
            preco_material: 690.00,
            valor: 900.00,
            valorfinal: 900.00,
            validacao_cliente: 'aprovado'
        },

        // 5. CONCLUÍDA / FECHADA
        {
            abertura: '16/11/2026',
            hora: '10:20:00',
            equipamento: 'MacBook Air M1',
            marca: 'Apple',
            perifericos: 'Cabo USB-C e fonte 30W',
            descricao: 'Bateria não segura carga e sistema apresentando lentidão.',
            processo: 'Concluída',
            status: 'fechada',
            idCliente: cliPedro?.idCliente,
            idTecnico: tecCarlos?.idTecnico,
            tecnico: tecCarlos?.nome,
            diagnostico: 'Bateria com 920 ciclos e saúde em 64%.',
            servico_executado: 'Troca da bateria interna, limpeza preventiva e recalibração.',
            data_finalizacao: '19/11/2026',
            preco_mao_obra: 160.00,
            preco_material: 480.00,
            valor: 700.00,
            valorfinal: 700.00,
            validacao_cliente: 'aprovado'
        },

        // 6. CANCELADA / RECUSADA PELO CLIENTE
        {
            abertura: '12/11/2026',
            hora: '15:10:00',
            equipamento: 'Monitor Ultrawide 29"',
            marca: 'LG',
            perifericos: 'Fonte externa',
            descricao: 'Mancha escura no canto direito do painel.',
            processo: 'Recusado pelo cliente',
            status: 'cancelada',
            idCliente: cliLucas?.idCliente,
            idTecnico: tecRafael?.idTecnico,
            tecnico: tecRafael?.nome,
            diagnostico: 'Painel LCD quebrado internamente; custo de reposição próximo ao de um monitor novo.',
            servico_executado: 'Orçamento recusado pelo cliente após análise.',
            data_finalizacao: '13/11/2026',
            preco_mao_obra: 90.00,
            preco_material: 750.00,
            valor: 900.00,
            valorfinal: 900.00,
            validacao_cliente: 'recusado'
        }
    ];

    for (const os of ordensExemplo) {
        await run(
            `INSERT INTO os (
                abertura, hora, equipamento, marca, perifericos, descricao,
                processo, status, idCliente, idTecnico, tecnico,
                diagnostico, servico_executado, data_finalizacao,
                preco_mao_obra, preco_material, valor, valorfinal, validacao_cliente
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                os.abertura, os.hora, os.equipamento, os.marca, os.perifericos, os.descricao,
                os.processo, os.status, os.idCliente, os.idTecnico, os.tecnico,
                os.diagnostico, os.servico_executado, os.data_finalizacao,
                os.preco_mao_obra, os.preco_material, os.valor, os.valorfinal, os.validacao_cliente
            ]
        );
    }

    console.log('Contas fixas e ordens de serviço de apresentação prontas!');
};

module.exports = { popularContasPadrao };