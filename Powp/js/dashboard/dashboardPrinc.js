// URL da API
const API_URL = 'http://127.0.0.1:8000/api';

// Função para buscar todos os dados do dashboard de uma vez
function fetchAllDashboardData() {
    // 1. Seleciona TODOS os elementos que vamos manipular de uma vez.
    const salesCountEl = document.getElementById('contador-vendas-hoje');
    const activeClientsEl = document.getElementById('contador-clientes-ativos');
    const salesValueEl = document.getElementById('valor-venda-hoje');
    const ticketMedioEl = document.getElementById('ticket-medio');

    // 2. Define o estado de carregamento para todos.
    if(salesCountEl) salesCountEl.textContent = '...';
    if(activeClientsEl) activeClientsEl.textContent = '...';
    if(salesValueEl) salesValueEl.textContent = '...';
    if(ticketMedioEl) ticketMedioEl.textContent = '...';

    // 3. Prepara as 3 promessas de fetch. Elas são disparadas em paralelo.
    const promiseQtdVendas = fetch(`${API_URL}/dados-qt-vendas-hoje`);
    const promiseClientes = fetch(`${API_URL}/dados-contagem-clientes`);
    const promiseValorVendas = fetch(`${API_URL}/dados-valor-vendas-hoje`);

    // 4. Usa Promise.all para esperar que TODAS as 3 promessas terminem.
    Promise.all([promiseQtdVendas, promiseClientes, promiseValorVendas])
        .then(responses => {
            // Converte todas as respostas para JSON.
            return Promise.all(responses.map(res => {
                if (!res.ok) {
                    throw new Error('Uma das respostas da API falhou.');
                }
                return res.json();
            }));
        })
        .then(data => {
            // 5. AGORA TEMOS TODOS OS DADOS!
            // data é um array com os resultados na mesma ordem das promessas.
            const [dadosQtdVendas, dadosClientes, dadosValorVendas] = data;

            // 6. Extrai os valores e faz os cálculos.
            const qtdVendas = Number(dadosQtdVendas.sales_today_count) || 0;
            const clientesAtivos = Number(dadosClientes.active_clients_count) || 0;
            const valorTotal = Number(dadosValorVendas.sales_value_today) || 0;

            let ticketMedio = 0;
            // Cálculo seguro para não dividir por zero!
            if (qtdVendas > 0) {
                ticketMedio = valorTotal / qtdVendas;
            }

            // 7. ATUALIZA TODOS os elementos do HTML com os dados finais.
            if(salesCountEl) salesCountEl.textContent = qtdVendas;
            if(activeClientsEl) activeClientsEl.textContent = clientesAtivos;

            if(salesValueEl) salesValueEl.textContent = valorTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            if(ticketMedioEl) ticketMedioEl.textContent = ticketMedio.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });
        })
        .catch(error => {
            // 8. Se QUALQUER uma das chamadas falhar, este bloco é executado.
            console.error('Erro ao buscar dados do dashboard:', error);
            if(salesCountEl) salesCountEl.textContent = 'Erro!';
            if(activeClientsEl) activeClientsEl.textContent = 'Erro!';
            if(salesValueEl) salesValueEl.textContent = 'Erro!';
            if(ticketMedioEl) ticketMedioEl.textContent = 'Erro!';
        });
}

const salesCtx = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(salesCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Vendas',
            data: [],
            borderColor: '#8e44ad',
            backgroundColor: 'rgba(142, 68, 173, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y:{
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    }
                }
            }
        }
    }
});

function fetchSalesChartData() {
    fetch(`${API_URL}/dados-grafico-vendas`)
        .then(response => response.json())
        .then(chartData => {

            salesChart.data.labels = chartData.labels;
            salesChart.data.datasets[0].data = chartData.data;

            salesChart.update();
        })
        .catch(error => {
            console.error('Erro ao buscar dados do gráfico de vendas:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado. Iniciando busca de dados para o dashboard...');
    
    fetchAllDashboardData();
    fetchSalesChartData();
});


// Configuração do gráfico de linha
/*const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['8 de jul.', '9 de jul.', '10 de jul.', '11 de jul.'],
            datasets: [{
                label: 'Vendas',
                data: [10000, 5000, 20000, 15000, 5000, 25000],
                borderColor: '#8e44ad',
                backgroundColor: 'rgba(142, 68, 173, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' mil';
                        }
                    }
                }
            }
        }
    });*/

    // Configuração do gráfico de produtos
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    const productsChart = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Placa Mãe B450-M', 'SSD 240gb Kingston', 'Caneta Bic Azul', 'Papel Chamex', 'Beb. 51 ICE'],
            datasets: [{
                data: [25, 20, 15, 20, 20],
                backgroundColor: [
                    '#f39c12',
                    '#e74c3c',
                    '#3498db',
                    '#9b59b6',
                    '#8b0000'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                }
            }
        }
    });

    // Configuração do gráfico de barras
    const barCtx = document.getElementById('barChart').getContext('2d');
    const barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['06/11', '07/11', '08/11', '09/11', '10/11', '11/11', '13/11'],
            datasets: [{
                label: 'Qtd. vendas',
                data: [50, 70, 90, 50, 30, 80, 85],
                backgroundColor: [
                    '#2ecc71',
                    '#f39c12',
                    '#9b59b6',
                    '#f1c40f',
                    '#8b0000',
                    '#27ae60',
                    '#8e44ad'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });

    // Configuração do gráfico de pagamentos
    const paymentCtx = document.getElementById('paymentChart').getContext('2d');
    const paymentChart = new Chart(paymentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Cartão Crédito', 'Cartão de Débito', 'Dinheiro', 'PIX', 'Boleto'],
            datasets: [{
                data: [35, 25, 15, 15, 10],
                backgroundColor: [
                    '#2ecc71',
                    '#f1c40f',
                    '#3498db',
                    '#9b59b6',
                    '#e74c3c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 15
                    }
                }
            }
        }
    });