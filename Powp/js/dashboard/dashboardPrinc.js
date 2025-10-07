const salesCtx = document.getElementById('salesChart').getContext('2d');
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
    });

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