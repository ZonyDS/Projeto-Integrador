// Aguarda o carregamento completo do DOM para executar o script
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';

    // Lógica específica para cada página
    if (path === 'index.html' || path === '') {
        setupLoginPage();
    } else if (path === 'dashboard.html') {
        setupDashboardPage();
    }
});

// --- LÓGICA DA PÁGINA DE LOGIN ---
function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const signupLink = document.getElementById('signup');

    const loginScreen = document.querySelector('.login-form:not(#role-selection-screen)');
    const roleSelectionScreen = document.getElementById('role-selection-screen');
    const roleButtonsContainer = document.getElementById('role-buttons');

    const showRoleSelection = () => {
        // Define um ID de usuário padrão para a sessão
        localStorage.setItem('userId', '99'); // ID de usuário genérico

        // Cria os botões de perfil
        roleButtonsContainer.innerHTML = `
            <div class="role-button" data-role="tecnico">Técnico</div>
            <div class="role-button" data-role="encarregado">Encarregado</div>
            <div class="role-button" data-role="gestor">Gestor</div>
        `;

        // Adiciona listeners aos novos botões de perfil
        document.querySelectorAll('.role-button').forEach(button => {
            button.addEventListener('click', () => {
                const selectedRole = button.dataset.role;
                localStorage.setItem('userRole', selectedRole);
                window.location.href = 'dashboard.html';
            });
        });

        // Alterna as telas
        loginScreen.style.display = 'none';
        roleSelectionScreen.style.display = 'flex';
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o recarregamento da página
        showRoleSelection();
    });

    googleLoginBtn.addEventListener('click', showRoleSelection);

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Funcionalidade "Esqueceu a senha" em desenvolvimento.');
    });

    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Funcionalidade "Cadastro" em desenvolvimento.');
    });
}

// --- LÓGICA DA PÁGINA DO DASHBOARD ---
function setupDashboardPage() {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    document.body.classList.add('dashboard'); // Adiciona classe para estilização específica

    // Se não houver perfil, volta para a página de login
    if (!userRole || !userId) {
        window.location.href = 'index.html';
        return;
    }

    updateHeaderTitle(userRole);

    // Configuração do Menu Hambúrguer e Navegação
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.sidebar a[data-view]');
    const content = document.getElementById('main-content');
    const logoutButton = document.getElementById('logout-button');
    const profileButton = document.getElementById('header-profile');
    const profileDropdown = document.getElementById('profile-dropdown');
    const dropdownLogoutButton = document.getElementById('dropdown-logout-button');

    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (window.innerWidth < 768) {
            overlay.classList.toggle('active');
        }
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    };

    logoutButton.addEventListener('click', handleLogout);
    dropdownLogoutButton.addEventListener('click', handleLogout);

    profileButton.addEventListener('click', (e) => {
        // Impede que o clique no ícone feche o menu imediatamente
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    // Fecha o dropdown se clicar em qualquer outro lugar
    document.addEventListener('click', (e) => {
        if (!profileButton.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    // Adiciona listener para os links do dropdown
    profileDropdown.querySelectorAll('a[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.getAttribute('data-view');
            profileDropdown.classList.remove('active');
            renderContent(view, userRole);
        });
    });

    // Navegação sem recarregar a página
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.getAttribute('data-view');
            renderContent(view, userRole);

            // Fecha o menu em telas pequenas após clicar
            if (window.innerWidth < 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    });

    // Renderiza a visão inicial do dashboard
    renderContent('dashboard', userRole);
    // Adiciona listeners de ação (serão adicionados dinamicamente na renderização)
    addGestorActionListeners();
    addEncarregadoFormListener();
    addTecnicoRequestClickListener();

    // Inicia o menu aberto em telas grandes
    if (window.innerWidth >= 768) {
        sidebar.classList.add('open');
    }
}

// --- DADOS MOCK (SIMULAÇÃO DE BANCO DE DADOS) ---
const mockData = {
    users: [
        { id: 1, name: 'Ana Silva', role: 'tecnico' },
        { id: 2, name: 'Bruno Costa', role: 'tecnico' },
        { id: 5, name: 'Sofia Oliveira', role: 'tecnico' },
        { id: 6, name: 'Lucas Martins', role: 'tecnico' },
        { id: 3, name: 'Carlos Dias', role: 'encarregado' },
        { id: 7, name: 'Ricardo Souza', role: 'encarregado' },
        { id: 4, name: 'Daniela Lima', role: 'gestor' },
    ],
    requests: [
        // Mês Atual
        { id: 1, userId: 1, requestedBy: 3, hours: 8, report: 'Manutenção emergencial no servidor de produção.', sector: 'Data Center', status: 'aprovado', date: new Date(new Date().setDate(2)), manager_reason: 'Aprovado. Atividade crítica para a operação.' },
        { id: 2, userId: 2, requestedBy: 3, hours: 4, report: 'Atualização de segurança no sistema legado.', sector: 'Sistemas Internos', status: 'pendente', date: new Date(new Date().setDate(5)) },
        { id: 3, userId: 5, requestedBy: 7, hours: 10, report: 'Implantação do novo módulo de faturamento.', sector: 'Financeiro', status: 'reprovado', date: new Date(new Date().setDate(3)), manager_reason: 'Orçamento para o projeto excedido este mês. Por favor, alinhar com o financeiro.' },
        { id: 4, userId: 6, requestedBy: 7, hours: 12, report: 'Correção de bugs críticos reportados pelo cliente A.', sector: 'Suporte N3', status: 'aprovado', date: new Date(new Date().setDate(8)) },
        { id: 5, userId: 1, requestedBy: 3, hours: 6, report: 'Acompanhar equipe externa de infraestrutura.', sector: 'Infraestrutura', status: 'aprovado', date: new Date(new Date().setDate(10)), manager_reason: 'Aprovado.' },
        { id: 6, userId: 2, requestedBy: 3, hours: 5, report: 'Treinamento e capacitação da nova equipe.', sector: 'RH', status: 'pendente', date: new Date(new Date().setDate(12)) },
        { id: 7, userId: 5, requestedBy: 7, hours: 8, report: 'Configuração de novos ambientes de desenvolvimento.', sector: 'DevOps', status: 'aprovado', date: new Date(new Date().setDate(15)) },
        { id: 8, userId: 6, requestedBy: 7, hours: 3, report: 'Inventário de equipamentos de rede.', sector: 'Redes', status: 'pendente', date: new Date(new Date().setDate(18)) },
        
        // Mês Anterior (para teste dos filtros de data)
        { id: 9, userId: 1, requestedBy: 3, hours: 10, report: 'Fechamento de atividades do projeto X.', sector: 'Projetos', status: 'aprovado', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 25)) },
        { id: 10, userId: 2, requestedBy: 3, hours: 8, report: 'Balanço de final de mês do sistema Y.', sector: 'Sistemas Internos', status: 'aprovado', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 28)) },
        { id: 11, userId: 5, requestedBy: 7, hours: 16, report: 'Go-live do sistema Z em cliente B.', sector: 'Implantação', status: 'aprovado', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 20)) },
        { id: 12, userId: 6, requestedBy: 7, hours: 8, report: 'Análise de performance dos bancos de dados.', sector: 'DBA', status: 'reprovado', date: new Date(new Date().setMonth(new Date().getMonth() - 1, 15)), manager_reason: 'Atividade não era prioritária para o mês.' },
        { id: 13, userId: 1, requestedBy: 7, hours: 7, report: 'Suporte técnico ao cliente C durante feriado.', sector: 'Suporte N1', status: 'aprovado', date: new Date(new Date().setDate(1)) },
        { id: 14, userId: 5, requestedBy: 3, hours: 9, report: 'Desenvolvimento de nova feature para o app mobile.', sector: 'Mobile', status: 'pendente', date: new Date(new Date().setDate(11)) },
        { id: 15, userId: 2, requestedBy: 7, hours: 11, report: 'Migração de servidor legado para a nuvem.', sector: 'Cloud', status: 'aprovado', date: new Date(new Date().setDate(4)) },
        { id: 16, userId: 6, requestedBy: 3, hours: 4, report: 'Reunião de alinhamento estratégico com a diretoria.', sector: 'Gestão', status: 'reprovado', date: new Date(new Date().setDate(6)), manager_reason: 'Reuniões estratégicas não são elegíveis para horas extras.' },
    ],
    unavailability: [
        { id: 1, userId: 1, date: new Date(new Date().setDate(20)), reason: 'Consulta médica agendada.'},
        { id: 2, userId: 5, date: new Date(new Date().setDate(25)), reason: 'Compromisso pessoal inadiável.'}
    ]
};

// --- RENDERIZAÇÃO DO CONTEÚDO DO DASHBOARD ---
function updateHeaderTitle(role) {
    const headerTitle = document.getElementById('header-title');
    headerTitle.textContent = `Painel do ${role.charAt(0).toUpperCase() + role.slice(1)}`;
}

function renderContent(view, role) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = ''; // Limpa o conteúdo anterior

    // Oculta/mostra links da barra lateral com base no perfil
    document.querySelector('a[data-view="users"]').style.display = (role === 'gestor') ? 'block' : 'none';
    document.querySelector('a[data-view="reports"]').style.display = (role === 'gestor' || role === 'encarregado') ? 'block' : 'none';
    document.querySelector('a[data-view="calendar"]').style.display = (role === 'tecnico') ? 'block' : 'none';
    // O link "Meu Perfil" no dropdown também é um navLink, então precisamos garantir que ele não fique oculto
    // A melhor abordagem é não ter "Meu Perfil" no menu lateral, apenas no dropdown.
    // Se estivesse no menu lateral, a linha abaixo seria necessária:
    // document.querySelector('a[data-view="profile"]').style.display = 'block';

    // Atualiza o link ativo no menu
    document.querySelectorAll('.sidebar a[data-view]').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === view) {
            link.classList.add('active');
        }
    });

    switch (view) {
        case 'dashboard':
            mainContent.innerHTML = renderDashboardView(role);
            break;
        case 'requests':
            mainContent.innerHTML = renderRequestsView(role);
            break;
        case 'reports':
            if (role === 'gestor') {
                mainContent.innerHTML = renderGestorReportsView();
                // Renderiza ambos os gráficos para o gestor
                setTimeout(renderHoursPerTechnicianChart, 0);
                setTimeout(renderOverallStatusChart, 0);
            } else if (role === 'encarregado') {
                // Simula o encarregado com ID 3
                mainContent.innerHTML = renderEncarregadoReportsView();
                setTimeout(() => renderHoursPerTechnicianForEncarregado(3), 0);
            }
            break;
        case 'calendar':
            mainContent.innerHTML = renderCalendarView(1); // Simula o técnico com ID 1
            break;
        case 'profile':
            mainContent.innerHTML = renderProfileView();
            break;
        case 'users':
            mainContent.innerHTML = renderUsersView();
            break;
        case 'requests':
            mainContent.innerHTML = renderGestorRequests();
            break;
        default:
            mainContent.innerHTML = renderDashboardView(role);
    }
}

// --- VISÃO PRINCIPAL DO DASHBOARD (RESUMO) ---
function renderDashboardView(role) {
    // Simula IDs para cada perfil
    // Usando o ID real salvo no login, com fallback para os IDs antigos
    const loggedInUserId = parseInt(localStorage.getItem('userId'));
    const userId = loggedInUserId || (role === 'tecnico' ? 1 : (role === 'encarregado' ? 3 : 4));

    if (role === 'tecnico') return renderTecnicoDashboard(userId);
    if (role === 'encarregado') return renderEncarregadoDashboard(userId);
    if (role === 'gestor') return renderGestorDashboard(); // Corrigido para chamar a função correta
    return '';
}

function renderProfileView() {
    const userId = parseInt(localStorage.getItem('userId'));
    const userRole = localStorage.getItem('userRole');
    
    // Pega os dados do localStorage ou usa valores padrão
    const userName = localStorage.getItem('userName') || "Usuário de Demonstração";
    const userEmail = localStorage.getItem('userEmail') || "email@exemplo.com";

    return `
        <div class="card">
            <h2>Meu Perfil</h2>
        </div>
        <div class="card">
            <div id="profile-view-mode">
                <h3>Informações da Conta</h3>
                <p><strong>Nome:</strong> <span id="profile-name">${userName}</span></p>
                <p><strong>E-mail:</strong> <span id="profile-email">${userEmail}</span></p>
                <p><strong>Perfil Ativo:</strong> <span class="user-role role-${userRole}">${userRole}</span></p>
                <div class="form-actions" style="margin-top: 1.5rem;">
                    <button id="edit-profile-btn" class="btn btn-primary">Editar Perfil</button>
                </div>
            </div>
            <div id="profile-edit-mode" style="display: none;">
                <h3>Editar Informações</h3>
                <form id="profile-edit-form">
                    <div class="form-group">
                        <label for="edit-name">Nome</label>
                        <input type="text" id="edit-name" value="${userName}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">E-mail</label>
                        <input type="email" id="edit-email" value="${userEmail}" required>
                    </div>
                    <div class="form-actions" style="margin-top: 1.5rem;">
                        <button type="submit" class="btn btn-success">Salvar</button>
                        <button type="button" id="cancel-edit-btn" class="btn btn-secondary">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
// --- VISÕES POR PERFIL ---

function renderTecnicoDashboard(userId) {
    const userRequests = mockData.requests.filter(req => req.userId === userId);
    const approvedHours = userRequests
        .filter(req => req.status === 'aprovado')
        .reduce((total, req) => total + req.hours, 0);

    const maxHours = 40;
    const hoursPercentage = Math.min((approvedHours / maxHours) * 100, 100);

    const pendingCount = userRequests.filter(r => r.status === 'pendente').length;

    return `
        <div class="card">
            <h2>Resumo Mensal</h2>
            <p><strong>Total de horas aprovadas:</strong> ${approvedHours} de ${maxHours}</p>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${hoursPercentage}%;">
                    ${approvedHours}h
                </div>
            </div>
        </div>
        <div class="card">
            <h2>Alertas</h2>
            <p>Você tem <strong>${pendingCount}</strong> solicitações com status pendente.</p>
        </div>
    `;
}

function renderRequestsView(role) {
    const userId = role === 'tecnico' ? 1 : (role === 'encarregado' ? 3 : 4);

    if (role === 'tecnico') return renderTecnicoRequests(userId);
    if (role === 'encarregado') return renderEncarregadoRequests(userId);
    if (role === 'gestor') return renderGestorRequests();
    return '';
}

function renderTecnicoRequests(userId) {
    const userRequests = mockData.requests.filter(req => req.userId === userId);
    let requestsHtml = '<div class="request-list">';
    if (userRequests.length === 0) {
        requestsHtml += '<p>Você não tem nenhuma solicitação de horas extras.</p>';
    } else {
        const buildList = (title, status) => {
            const filtered = userRequests.filter(r => r.status === status);
            if (filtered.length === 0) return '';
            let listHtml = `<h3>${title}</h3>`;
            filtered.forEach(req => {
                listHtml += `
                    <div class="request-item clickable" data-request-id="${req.id}">
                        <p><strong>${req.hours} horas</strong> - ${new Date(req.date).toLocaleDateString('pt-BR')} - <span>${req.report.substring(0, 40)}...</span></p>
                    </div>
                `;
            });
            return listHtml;
        };
        requestsHtml += buildList('Aprovadas', 'aprovado');
        requestsHtml += buildList('Pendentes', 'pendente');
        requestsHtml += buildList('Reprovadas', 'reprovado');
    }
    requestsHtml += '</div>';

    return `
        <div class="card">
            <h2>Suas Solicitações</h2>
            ${requestsHtml}
        </div>
    `;
}

function renderEncarregadoRequests(encarregadoId) {
    const myRequests = mockData.requests.filter(req => req.requestedBy === encarregadoId);
    let requestsHtml = '<div class="request-list">';
    if (myRequests.length === 0) {
        requestsHtml += '<p>Você ainda não criou nenhuma solicitação.</p>';
    } else {
        myRequests.forEach(req => {
            const tecnico = mockData.users.find(u => u.id === req.userId);
            requestsHtml += `
                <div class="request-item">
                    <div class="info">
                        <strong>${tecnico.name} - ${req.hours} horas</strong> - <span>${req.report}</span>
                    </div>
                    <span class="status ${req.status}">${req.status}</span>
                </div>
            `;
        });
    }
    requestsHtml += '</div>';

    return `
        <div class="card">
            <h2>Solicitações Criadas</h2>
            ${requestsHtml}
        </div>
    `;
}

function renderGestorReportsView() {
    const monthName = new Date().toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return `
        <div class="card">
            <h2>Relatórios de ${capitalizedMonth}</h2>
            <p>Análise detalhada das solicitações de horas extras do mês corrente.</p>
        </div>
        <div class="card">
            <h3>Horas por Técnico</h3>
            <div class="chart-container">
                <canvas id="hoursPerTechnicianChart"></canvas>
            </div>
        </div>
        <div class="card">
            <h3>Distribuição Geral de Solicitações</h3>
            <div class="chart-container" style="height: 300px;">
                <canvas id="overallStatusChart"></canvas>
            </div>
        </div>
    `;
}

function renderEncarregadoReportsView() {
    const monthName = new Date().toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return `
        <div class="card">
            <h2>Relatório de ${capitalizedMonth}</h2>
            <p>Análise das solicitações de horas extras criadas por você.</p>
        </div>
        <div class="card">
            <h3>Horas por Técnico</h3>
            <div class="chart-container">
                <canvas id="encarregadoHoursChart"></canvas>
            </div>
        </div>
    `;
}

function renderCalendarView(userId) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthName = now.toLocaleString('pt-BR', { month: 'long' });
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Dom, 1=Seg,...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHtml = `
        <div class="card">
            <div class="calendar-header">
                <h3>${capitalizedMonth} ${year}</h3>
            </div>
            <div class="help-text">
                <p>💡 **Dica:** Clique em um dia no calendário para visualizar os detalhes de um evento ou para informar um dia de indisponibilidade.</p>
            </div>
            <div class="calendar-grid">
                ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => `<div class="calendar-day-name">${d}</div>`).join('')}
    `;

    // Dias em branco antes do início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHtml += `<div class="calendar-day other-month"></div>`;
    }

    // Preenche os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const approvedRequest = mockData.requests.find(r => 
            r.userId === userId && 
            r.status === 'aprovado' &&
            new Date(r.date).toDateString() === dayDate.toDateString()
        );
        const unavailability = mockData.unavailability.find(u => 
            u.userId === userId &&
            new Date(u.date).toDateString() === dayDate.toDateString()
        );

        let dayClass = 'calendar-day';
        let eventHtml = '';
        if (unavailability) {
            dayClass += ' day-unavailable';
        }
        if (approvedRequest) {
            eventHtml = `<div class="day-event">${approvedRequest.hours}h - ${approvedRequest.sector}</div>`;
        }

        calendarHtml += `
            <div class="${dayClass}" data-date="${dayDate.toISOString()}">
                <div class="day-number">${day}</div>
                ${eventHtml}
            </div>
        `;
    }

    calendarHtml += '</div></div>';

    // Adiciona listener de clique para os dias do calendário
    setTimeout(() => {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', (e) => {
                const dateStr = e.currentTarget.dataset.date;
                if (dateStr) openDayModal(new Date(dateStr), userId);
            });
        });
    }, 0);

    return calendarHtml;
}

function openDayModal(date, userId) {
    const modal = document.getElementById('calendar-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    modalTitle.textContent = `Detalhes de ${date.toLocaleDateString('pt-BR')}`;
    
    const approvedRequest = mockData.requests.find(r => r.userId === userId && r.status === 'aprovado' && new Date(r.date).toDateString() === date.toDateString());
    const unavailability = mockData.unavailability.find(u => u.userId === userId && new Date(u.date).toDateString() === date.toDateString());

    let bodyHtml = '<h4>Eventos do Dia</h4>';
    if (approvedRequest) {
        bodyHtml += `<p><strong>Hora Extra Agendada:</strong> ${approvedRequest.hours}h</p>`;
        bodyHtml += `<p><strong>Setor:</strong> ${approvedRequest.sector}</p>`;
        bodyHtml += `<p><strong>Lembrete:</strong> ${approvedRequest.report}</p>`;
    } else {
        bodyHtml += '<p>Nenhuma hora extra agendada para este dia.</p>';
    }

    bodyHtml += '<hr style="margin: 1rem 0;"><h4>Informar Indisponibilidade</h4>';
    if (unavailability) {
        bodyHtml += `<p><strong>Motivo informado:</strong> ${unavailability.reason}</p>`;
    } else {
        bodyHtml += `
            <form id="unavailability-form">
                <div class="form-group">
                    <label for="unavailability-reason">Motivo da indisponibilidade neste dia:</label>
                    <textarea id="unavailability-reason" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Salvar</button>
            </form>
        `;
    }

    modalBody.innerHTML = bodyHtml;
    modal.style.display = 'flex';

    modalCloseBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    const form = document.getElementById('unavailability-form');
    if (form) {
        form.addEventListener('submit', (e) => handleUnavailabilitySubmit(e, date, userId));
    }
}

function handleUnavailabilitySubmit(event, date, userId) {
    event.preventDefault();
    const reason = document.getElementById('unavailability-reason').value;
    mockData.unavailability.push({
        id: mockData.unavailability.length + 1,
        userId: userId,
        date: date,
        reason: reason
    });
    document.getElementById('calendar-modal').style.display = 'none';
    renderContent('calendar', 'tecnico');
    showToast('Indisponibilidade salva com sucesso!', 'success');
}

function openRequestDetailsModal(requestId) {
    const request = mockData.requests.find(r => r.id === requestId);
    if (!request) return;

    const modal = document.getElementById('calendar-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    modalTitle.textContent = `Detalhes da Solicitação`;

    let bodyHtml = `
        <p><strong>Data:</strong> ${new Date(request.date).toLocaleDateString('pt-BR')}</p>
        <p><strong>Horas Solicitadas:</strong> ${request.hours}h</p>
        <p><strong>Setor:</strong> ${request.sector || 'Não especificado'}</p>
        <p><strong>Status:</strong> <span class="status ${request.status}">${request.status}</span></p>
        <hr style="margin: 1rem 0;">
        <h4>Seu Relatório:</h4>
        <p>${request.report}</p>
        <hr style="margin: 1rem 0;">
        <h4>Feedback do Gestor:</h4>
        <p><em>${request.manager_reason || "Nenhum feedback fornecido."}</em></p>
    `;

    modalBody.innerHTML = bodyHtml;
    modal.style.display = 'flex';

    modalCloseBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
}

function renderOverallStatusChart() {
    const ctx = document.getElementById('overallStatusChart')?.getContext('2d');
    if (!ctx) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const requestsThisMonth = mockData.requests.filter(r => {
        const requestDate = new Date(r.date);
        return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
    });

    const data = {
        labels: ['Aprovadas', 'Pendentes', 'Reprovadas'],
        datasets: [{
            label: 'Nº de Solicitações',
            data: [
                requestsThisMonth.filter(r => r.status === 'aprovado').length,
                requestsThisMonth.filter(r => r.status === 'pendente').length,
                requestsThisMonth.filter(r => r.status === 'reprovado').length
            ],
            backgroundColor: [
                'rgba(40, 167, 69, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(220, 53, 69, 0.7)'
            ],
            borderColor: [
                'rgba(40, 167, 69, 1)',
                'rgba(255, 193, 7, 1)',
                'rgba(220, 53, 69, 1)'
            ],
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
        }
    });
}

function renderHoursPerTechnicianForEncarregado(encarregadoId) {
    const ctx = document.getElementById('encarregadoHoursChart')?.getContext('2d');
    if (!ctx) return;

    const technicians = mockData.users.filter(u => u.role === 'tecnico');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filtra apenas as requisições criadas pelo encarregado logado
    const requestsThisMonth = mockData.requests.filter(r => {
        const requestDate = new Date(r.date);
        return r.requestedBy === encarregadoId &&
               requestDate.getMonth() === currentMonth && 
               requestDate.getFullYear() === currentYear;
    });

    const labels = technicians.map(t => t.name);

    const approvedData = technicians.map(tech => {
        return requestsThisMonth
            .filter(req => req.userId === tech.id && req.status === 'aprovado')
            .reduce((total, req) => total + req.hours, 0);
    });

    const disapprovedData = technicians.map(tech => {
        return requestsThisMonth
            .filter(req => req.userId === tech.id && req.status === 'reprovado')
            .reduce((total, req) => total + req.hours, 0);
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Horas Aprovadas',
                    data: approvedData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Horas Reprovadas',
                    data: disapprovedData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: { y: { beginAtZero: true } },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderHoursPerTechnicianChart() {
    const ctx = document.getElementById('hoursPerTechnicianChart')?.getContext('2d');
    if (!ctx) return;

    const technicians = mockData.users.filter(u => u.role === 'tecnico');
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const requestsThisMonth = mockData.requests.filter(r => {
        const requestDate = new Date(r.date);
        return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
    });

    const labels = technicians.map(t => t.name);

    const approvedData = technicians.map(tech => {
        return requestsThisMonth
            .filter(req => req.userId === tech.id && req.status === 'aprovado')
            .reduce((total, req) => total + req.hours, 0);
    });

    const disapprovedData = technicians.map(tech => {
        return requestsThisMonth
            .filter(req => req.userId === tech.id)
            .filter(req => req.status === 'reprovado')
            .reduce((total, req) => total + req.hours, 0);
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Horas Aprovadas',
                    data: approvedData,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)', // Success color
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Horas Reprovadas',
                    data: disapprovedData,
                    backgroundColor: 'rgba(220, 53, 69, 0.7)', // Danger color
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderUsersView() {
    let usersHtml = '<div class="user-list">';
    mockData.users.forEach(user => {
        usersHtml += `
            <div class="user-item">
                <span class="user-name">${user.name}</span>
                <span class="user-role role-${user.role}">${user.role}</span>
            </div>
        `;
    });
    usersHtml += '</div>';

    return `
        <div class="card">
            <h2>Usuários do Sistema</h2>
        </div>
        <div class="card">
            ${usersHtml}
        </div>
    `;
}

function renderEncarregadoDashboard(encarregadoId) {
    const tecnicos = mockData.users.filter(u => u.role === 'tecnico');
    let tecnicosOptions = tecnicos.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    const pendingCount = mockData.requests.filter(r => r.requestedBy === encarregadoId && r.status === 'pendente').length;

    return `
        <div class="card">
            <h2>Atividade Recente</h2>
            <p>Existem <strong>${pendingCount}</strong> solicitações pendentes de aprovação pelo gestor.</p>
        </div>
        <div class="card">
            <h2>Criar Nova Solicitação de Hora Extra</h2>
            <form id="new-request-form">
                <div class="form-group">
                    <label for="tecnico-select">Técnico</label>
                    <select id="tecnico-select" required>${tecnicosOptions}</select>
                </div>
                <div class="form-group">
                    <label for="hours-input">Horas Necessárias</label>
                    <input type="number" id="hours-input" min="1" required placeholder="Ex: 8" />
                </div>
                <div class="form-group">
                    <label for="report-textarea">Relatório/Justificativa</label>
                    <textarea id="report-textarea" rows="4" required placeholder="Descreva o motivo da solicitação de horas extras..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Enviar Solicitação</button>
                    <button type="reset" class="btn btn-secondary">Limpar</button>
                </div>
            </form>
        </div>
    `;
}

function renderGestorDashboard() {
    const pendingCount = mockData.requests.filter(r => r.status === 'pendente').length;
    const totalHoursApproved = mockData.requests
        .filter(r => r.status === 'aprovado')
        .reduce((sum, r) => sum + r.hours, 0);

    // Pega as 3 últimas solicitações pendentes para o dashboard
    const latestPendingRequests = mockData.requests.filter(r => r.status === 'pendente').slice(-3).reverse();

    let latestRequestsHtml = '<div class="request-list">';
    if (latestPendingRequests.length > 0) {
        latestPendingRequests.forEach(req => {
            const tecnico = mockData.users.find(u => u.id === req.userId);
            latestRequestsHtml += `
                <div class="request-item">
                    <div class="info">
                        <p><strong>Técnico:</strong> ${tecnico.name} | <strong>Horas:</strong> ${req.hours}h</p>
                        <p class="details" style="border-top: none; padding-top: 5px; margin-top: 0;">${req.report.substring(0, 50)}...</p>
                    </div>
                    <div class="actions">
                        <button class="btn btn-success approve-btn" data-id="${req.id}">Aprovar</button>
                        <button class="btn btn-danger deny-btn" data-id="${req.id}">Reprovar</button>
                    </div>
                </div>
            `;
        });
    } else {
        latestRequestsHtml += '<p>Nenhuma solicitação pendente no momento.</p>';
    }
    latestRequestsHtml += '</div>';

    return `
        <div class="card"><h2>Dashboard do Gestor</h2></div>
        <div class="card"><h3>Indicadores Chave</h3><p><strong>${pendingCount}</strong> solicitações pendentes. | <strong>${totalHoursApproved}h</strong> aprovadas este mês.</p></div>
        <div class="card"><h3>Ações Rápidas</h3>${latestRequestsHtml}</div>
    `;
}

function renderGestorRequests() {
    const tecnicos = mockData.users.filter(u => u.role === 'tecnico');
    const encarregados = mockData.users.filter(u => u.role === 'encarregado');

    let tecnicosOptions = '<option value="">Todos os Técnicos</option>';
    tecnicos.forEach(t => {
        tecnicosOptions += `<option value="${t.id}">${t.name}</option>`;
    });

    let encarregadosOptions = '<option value="">Todos os Encarregados</option>';
    encarregados.forEach(e => {
        encarregadosOptions += `<option value="${e.id}">${e.name}</option>`;
    });

    let requestsHtml = '<div class="request-list">';
    if (mockData.requests.length === 0) {
        requestsHtml += '<p>Nenhuma solicitação encontrada.</p>';
    } else {
        mockData.requests.forEach(req => {
            const tecnico = mockData.users.find(u => u.id === req.userId);
            const encarregado = mockData.users.find(u => u.id === req.requestedBy);
            let actions = '';

            if (req.status === 'pendente') {
                actions = `
                    <button class="btn btn-success approve-btn" data-id="${req.id}">Aprovar</button>
                    <button class="btn btn-danger deny-btn" data-id="${req.id}">Reprovar</button>
                `;
            }

            requestsHtml += `
                <div class="request-item">
                    <div class="info">
                        <p><strong>Técnico:</strong> ${tecnico.name} | <strong>Horas:</strong> ${req.hours}h</p>
                        <p style="font-size: 0.9em; color: #6c757d;">Solicitado por: ${encarregado.name}</p>
                    </div>
                    <div class="actions" style="text-align: right;">
                        <span class="status ${req.status}">${req.status}</span>
                        ${actions}
                    </div>
                    <div class="details">${req.report}</div>
                </div>
            `;
        });
    }
    requestsHtml += '</div>';

    return `
        <div class="card">
            <h2>Gerenciamento de Solicitações</h2>
            <div class="filter-container">
                <div class="search-wrapper">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="search-input" placeholder="Buscar por termo no relatório...">
                </div>
                <select id="status-filter">
                    <option value="">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="reprovado">Reprovado</option>
                </select>
                <button id="toggle-advanced-filters" class="btn btn-secondary">Filtros Avançados</button>
            </div>
            <div id="advanced-filters" class="advanced-filters-container" style="display: none;">
                <div class="form-group">
                    <label>Técnico</label>
                    <select id="tecnico-filter">${tecnicosOptions}</select>
                </div>
                <div class="form-group">
                    <label>Encarregado</label>
                    <select id="encarregado-filter">${encarregadosOptions}</select>
                </div>
                <div class="form-group">
                    <label>De:</label>
                    <input type="date" id="start-date-filter">
                </div>
                <div class="form-group">
                    <label>Até:</label>
                    <input type="date" id="end-date-filter">
                </div>
            </div>
        </div>
        <div class="card">
            <div id="request-list-container">${requestsHtml}</div>
        </div>
    `;
}

// --- MANIPULADORES DE EVENTOS (ACTIONS) ---

function addFilterListeners() {
    const toggleBtn = document.getElementById('toggle-advanced-filters');
    const advancedFilters = document.getElementById('advanced-filters');

    toggleBtn?.addEventListener('click', () => {
        // Se o botão for clicado, aplicamos os filtros para garantir que a lista esteja atualizada
        // com o estado atual dos campos, mesmo que o usuário não interaja com eles.
        applyFilters();

        const isVisible = advancedFilters.style.display === 'grid';
        advancedFilters.style.display = isVisible ? 'none' : 'grid';
    });

    // A lógica funcional dos filtros foi removida para esta versão,
    // tornando-os apenas visuais.
}

function addGestorActionListeners() {
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const requestId = parseInt(e.target.dataset.id);
            if (confirm('Tem certeza que deseja APROVAR esta solicitação?')) {
                const request = mockData.requests.find(r => r.id === requestId);
                if (request) {
                    request.status = 'aprovado';
                    const currentView = document.querySelector('.sidebar a.active')?.dataset.view || 'dashboard';
                    renderContent(currentView, 'gestor');
                    showToast('Solicitação aprovada.', 'success');
                }
            }
        });
    });

    document.querySelectorAll('.deny-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const requestId = parseInt(e.target.dataset.id);
            if (confirm('Tem certeza que deseja REPROVAR esta solicitação?')) {
                const request = mockData.requests.find(r => r.id === requestId);
                if (request) {
                    request.status = 'reprovado';
                    const currentView = document.querySelector('.sidebar a.active')?.dataset.view || 'dashboard';
                    renderContent(currentView, 'gestor');
                    showToast('Solicitação reprovada.', 'error');
                }
            }
        });
    });
}

function addEncarregadoFormListener() {
    const form = document.getElementById('new-request-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newRequest = {
            id: mockData.requests.length + 1,
            userId: parseInt(document.getElementById('tecnico-select').value),
            requestedBy: 3, // ID do encarregado logado
            hours: parseInt(document.getElementById('hours-input').value),
            report: document.getElementById('report-textarea').value,
            status: 'pendente'
        };
        mockData.requests.push(newRequest);
        renderContent('dashboard', 'encarregado'); // Re-renderiza a visão
        showToast('Solicitação criada com sucesso!', 'success');
    });
}

function addEncarregadoFormListener() {
    // Usa delegação de eventos para garantir que o listener funcione mesmo com re-renderização
    document.getElementById('main-content').addEventListener('submit', function(e) {
        if (e.target.id === 'new-request-form') {
            e.preventDefault();
            const newRequest = {
                id: mockData.requests.length + 1,
                userId: parseInt(document.getElementById('tecnico-select').value),
                requestedBy: 3, // ID do encarregado logado
                hours: parseInt(document.getElementById('hours-input').value),
                report: document.getElementById('report-textarea').value,
                status: 'pendente'
            };
            mockData.requests.push(newRequest);
            renderContent('dashboard', 'encarregado'); // Re-renderiza a visão
            showToast('Solicitação criada com sucesso!', 'success');
        }
    });
}

function addEncarregadoFormListener() {
    // Usa delegação de eventos para garantir que o listener funcione mesmo com re-renderização
    document.getElementById('main-content').addEventListener('submit', function(e) {
        if (e.target.id === 'new-request-form') {
            e.preventDefault();
            handleNewRequestSubmit();
        }
    });
}

function addTecnicoRequestClickListener() {
    document.getElementById('main-content').addEventListener('click', function(e) {
        const requestItem = e.target.closest('.request-item.clickable');
        if (requestItem) {
            const requestId = parseInt(requestItem.dataset.requestId);
            if (requestId) {
                openRequestDetailsModal(requestId);
            }
        }
    });

    // Adiciona listeners para a página de perfil, se ela for renderizada
    addProfileEditListeners();

    // Adiciona listeners para os filtros do gestor
    addFilterListeners();
}

// --- FUNÇÕES DE UTILIDADE (HEURÍSTICAS) ---

/**
 * Exibe uma notificação toast na tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {string} type 'success' ou 'error'.
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4500); // Remove o toast após a animação
}

function handleNewRequestSubmit() {
    const reportText = document.getElementById('report-textarea').value;

    // Simulação de falha
    if (reportText.toLowerCase().includes('problema')) {
        showToast('Falha ao criar solicitação. Tente novamente.', 'error');
        return;
    }

    const newRequest = {
        id: mockData.requests.length + 1,
        userId: parseInt(document.getElementById('tecnico-select').value),
        requestedBy: 3, // ID do encarregado logado
        hours: parseInt(document.getElementById('hours-input').value),
        report: reportText,
        status: 'pendente'
    };
    mockData.requests.push(newRequest);
    renderContent('dashboard', 'encarregado'); // Re-renderiza a visão
    showToast('Solicitação criada com sucesso!', 'success');
}

function addProfileEditListeners() {
    document.getElementById('main-content').addEventListener('click', function(e) {
        if (e.target.id === 'edit-profile-btn') {
            document.getElementById('profile-view-mode').style.display = 'none';
            document.getElementById('profile-edit-mode').style.display = 'block';
        }

        if (e.target.id === 'cancel-edit-btn') {
            document.getElementById('profile-view-mode').style.display = 'block';
            document.getElementById('profile-edit-mode').style.display = 'none';
        }
    });

    document.getElementById('main-content').addEventListener('submit', function(e) {
        if (e.target.id === 'profile-edit-form') {
            e.preventDefault();
            const newName = document.getElementById('edit-name').value;
            const newEmail = document.getElementById('edit-email').value;

            // Simulação de falha: se o nome contiver "erro", exibe um toast de erro.
            if (newName.toLowerCase().includes('erro')) {
                showToast('Falha ao atualizar o perfil. Tente novamente.', 'error');
                return; // Interrompe a execução para não salvar
            }

            // Simula o salvamento no localStorage
            localStorage.setItem('userName', newName);
            localStorage.setItem('userEmail', newEmail);

            // Atualiza a visualização
            document.getElementById('profile-name').textContent = newName;
            document.getElementById('profile-email').textContent = newEmail;

            document.getElementById('profile-view-mode').style.display = 'block';
            document.getElementById('profile-edit-mode').style.display = 'none';

            showToast('Perfil atualizado com sucesso!', 'success'); // Mensagem de sucesso
        }
    });
}
