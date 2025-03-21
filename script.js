document.addEventListener('DOMContentLoaded', function() {
    const turnoSelect = document.getElementById('turno');
    const horarioAulaTable = document.getElementById('horarioAula');

    // Função para preencher os selects de hora e minuto
    function populateTimeSelects(row) {
        const horaInicioSelect = row.querySelector('.horaInicio');
        const minutoInicioSelect = row.querySelector('.minutoInicio');
        const horaTerminoSelect = row.querySelector('.horaTermino');
        const minutoTerminoSelect = row.querySelector('.minutoTermino');

        // Limpa e preenche as opções de hora
        if (horaInicioSelect && horaTerminoSelect) {
            horaInicioSelect.innerHTML = '<option value="">Hora</option>';
            horaTerminoSelect.innerHTML = '<option value="">Hora</option>';
            
            const turno = turnoSelect.value;
            let startHour, endHour;
            
            if (turno === 'Manhã') {
                startHour = 6;
                endHour = 14;
            } else if (turno === 'Tarde') {
                startHour = 12;
                endHour = 19;
            } else if (turno === 'Noite') {
                startHour = 18;
                endHour = 23;
            } else {
                // Se nenhum turno foi selecionado, usar um intervalo padrão
                startHour = 7;
                endHour = 22;
            }

            for (let i = startHour; i <= endHour; i++) {
                const formattedHour = String(i).padStart(2, '0');
                horaInicioSelect.innerHTML += `<option value="${formattedHour}">${formattedHour}</option>`;
                horaTerminoSelect.innerHTML += `<option value="${formattedHour}">${formattedHour}</option>`;
            }
        }

        // Limpa e preenche as opções de minuto
        if (minutoInicioSelect && minutoTerminoSelect) {
            minutoInicioSelect.innerHTML = '<option value="">Min</option>';
            minutoTerminoSelect.innerHTML = '<option value="">Min</option>';
            
            // Adicionar minutos de 5 em 5
            for (let i = 0; i < 60; i += 5) {
                const formattedMinute = String(i).padStart(2, '0');
                minutoInicioSelect.innerHTML += `<option value="${formattedMinute}">${formattedMinute}</option>`;
                minutoTerminoSelect.innerHTML += `<option value="${formattedMinute}">${formattedMinute}</option>`;
            }
            // Certificar que 00 está incluso
            if (!minutoInicioSelect.querySelector('option[value="00"]')) {
                minutoInicioSelect.innerHTML = '<option value="">Min</option><option value="00">00</option>' + minutoInicioSelect.innerHTML;
                minutoTerminoSelect.innerHTML = '<option value="">Min</option><option value="00">00</option>' + minutoTerminoSelect.innerHTML;
            }
        }
    }

    // Preencher os selects quando o turno é alterado
    turnoSelect.addEventListener('change', function() {
        const rows = horarioAulaTable.querySelectorAll('tbody tr');
        rows.forEach(populateTimeSelects);
    });

    // Preencher os selects na carga inicial da página
    const rows = horarioAulaTable.querySelectorAll('tbody tr');
    rows.forEach(populateTimeSelects);
});

// Função para gerar o PDF
function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const rowHeight = 10;
    const primaryColor = '#04456D'; // Azul escuro corporativo
    const secondaryColor = '#04456D'; // Azul médio para subtítulos
    let y = margin;

    // Adicionar logo ou cabeçalho
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12); // Reduced font size to fit better
    doc.setFont('helvetica', 'bold');
    doc.text('COLETA DE CLASSE - ATIVIDADES CURRICULARES DESPORTIVAS E ARTÍSTICAS (ACDA)', pageWidth / 2, 15, { align: 'center' });

    y = 35; // Espaço após o cabeçalho

    // Função auxiliar para criar cabeçalhos de seção
    function criarCabecalhoSecao(texto, posY) {
        doc.setFillColor(secondaryColor);
        doc.rect(margin, posY, contentWidth, rowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(texto, margin + 3, posY + rowHeight - 2);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        return posY + rowHeight;
    }

    // Função auxiliar para criar rótulos e valores
    function criarCampo(rotulo, valor, posY, larguraRotulo = 40) {
        doc.setFillColor(240, 240, 240);
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, posY, larguraRotulo, rowHeight, 'FD');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(rotulo, margin + 2, posY + rowHeight - 2);
        
        doc.setFillColor(255, 255, 255);
        doc.rect(margin + larguraRotulo, posY, contentWidth - larguraRotulo, rowHeight, 'FD');
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(valor || '—', margin + larguraRotulo + 2, posY + rowHeight - 2);
        
        return posY + rowHeight;
    }

    // Função auxiliar para criar campos em duas colunas
    function criarCamposDuplos(rotulo1, valor1, rotulo2, valor2, posY) {
        const colWidth = contentWidth / 2 - 2;
        
        // Primeiro campo
        doc.setFillColor(240, 240, 240);
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, posY, 40, rowHeight, 'FD');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(rotulo1, margin + 2, posY + rowHeight - 2);
        
        doc.setFillColor(255, 255, 255);
        doc.rect(margin + 40, posY, colWidth - 40 + 2, rowHeight, 'FD');
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(valor1 || '—', margin + 42, posY + rowHeight - 2);
        
        // Segundo campo
        doc.setFillColor(240, 240, 240);
        doc.rect(margin + colWidth + 4, posY, 40, rowHeight, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60);
        doc.text(rotulo2, margin + colWidth + 6, posY + rowHeight - 2);
        
        doc.setFillColor(255, 255, 255);
        doc.rect(margin + colWidth + 44, posY, colWidth - 40, rowHeight, 'FD');
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(valor2 || '—', margin + colWidth + 46, posY + rowHeight - 2);
        
        return posY + rowHeight;
    }
    
    // Informações Básicas
    y = criarCabecalhoSecao('INFORMAÇÕES BÁSICAS', y);
    y = criarCampo('Tipo de Ensino:', document.getElementById('tipoEnsino').value, y, 40);
    y = criarCamposDuplos('Série:', document.getElementById('serie').value, 'Turma:', document.getElementById('turma').value, y);
    y = criarCampo('Turno:', document.getElementById('turno').value, y, 40);
    
    // Horário da Aula
    y += 5; // Espaço adicional
    y = criarCabecalhoSecao('HORÁRIO DA AULA', y);
    
    // Cabeçalho da tabela de horários
    const colunas = ['Aula', 'Dia', 'Hora Início', 'Hora Término'];
    const colWidths = [contentWidth * 0.1, contentWidth * 0.3, contentWidth * 0.3, contentWidth * 0.3];
    
    doc.setFillColor(primaryColor);
    doc.setDrawColor(80, 80, 80);
    
    let currentX = margin;
    for (let i = 0; i < colunas.length; i++) {
        doc.rect(currentX, y, colWidths[i], rowHeight, 'FD');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(colunas[i], currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
        currentX += colWidths[i];
    }
    y += rowHeight;
    
    // Linhas da tabela de horários
    const rows = document.querySelectorAll('#horarioAula tbody tr');
    let rowAdded = false;
    
    rows.forEach((row, index) => {
        const dia = row.querySelector('.diaSemana').value || '';
        const horaInicio = row.querySelector('.horaInicio').value || '';
        const minutoInicio = row.querySelector('.minutoInicio').value || '';
        const horaTermino = row.querySelector('.horaTermino').value || '';
        const minutoTermino = row.querySelector('.minutoTermino').value || '';
        
        // Verificar se pelo menos o dia está preenchido
        if (dia) {
            rowAdded = true;
            currentX = margin;
            
            const aulaNumero = `${index + 1}ª`;
            const horarioInicio = horaInicio && minutoInicio ? `${horaInicio}:${minutoInicio}` : '—';
            const horarioTermino = horaTermino && minutoTermino ? `${horaTermino}:${minutoTermino}` : '—';
            
            const rowData = [aulaNumero, dia, horarioInicio, horarioTermino];
            
            // Alternar cores de fundo para melhorar legibilidade
            const rowColor = index % 2 === 0 ? 255 : 245;
            
            for (let i = 0; i < rowData.length; i++) {
                doc.setFillColor(rowColor, rowColor, rowColor);
                doc.rect(currentX, y, colWidths[i], rowHeight, 'FD');
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.text(rowData[i], currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
                currentX += colWidths[i];
            }
            y += rowHeight;
        }
    });
    
    // Se nenhuma linha foi adicionada, adicionar uma linha vazia
    if (!rowAdded) {
        currentX = margin;
        for (let i = 0; i < colunas.length; i++) {
            doc.setFillColor(255, 255, 255);
            doc.rect(currentX, y, colWidths[i], rowHeight, 'FD');
            doc.text('—', currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
            currentX += colWidths[i];
        }
        y += rowHeight;
    }
    
    // Informações da Classe
    y += 5; // Espaço adicional
    y = criarCabecalhoSecao('INFORMAÇÕES DA CLASSE', y);
    y = criarCampo('Tipo de Classe:', document.getElementById('tipoClasse').value, y, 40);
    
    // Converter data de YYYY-MM-DD para DD/MM/YYYY
    let dataInicio = document.getElementById('dataInicio').value;
    if (dataInicio) {
        const partes = dataInicio.split('-');
        if (partes.length === 3) {
            dataInicio = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    y = criarCampo('Data Início:', dataInicio, y, 40);
    
    // Categoria, Modalidade e Gênero
    y = criarCampo('Categoria:', document.getElementById('categoria').value, y, 40);
    y = criarCampo('Modalidade:', document.getElementById('modalidade').value, y, 40);
    y = criarCampo('Gênero:', document.getElementById('genero').value, y, 40);
    y = criarCampo('Número da Sala:', document.getElementById('numeroSala').value, y, 40);
    
    // Verificar se precisa de nova página para as observações
    if (y + 40 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        y = margin;
    }
    
    // Observações
    y += 5; // Espaço adicional
    y = criarCabecalhoSecao('OBSERVAÇÕES', y);
    
    const observacoes = document.getElementById('observacoes').value || 'Nenhuma observação.';
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, contentWidth, 30, 'FD');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Adicionar texto de observações com quebra de linha
    const textLines = doc.splitTextToSize(observacoes, contentWidth - 4);
    for (let i = 0; i < textLines.length; i++) {
        if (y + (i * 5) + 5 > doc.internal.pageSize.getHeight()) {
            doc.addPage();
            y = margin;
            i = 0; // Reiniciar para a nova página
        }
        doc.text(textLines[i], margin + 2, y + (i + 1) * 5);
    }
    
    y += Math.max(30, textLines.length * 5 + 5);
    
    // Rodapé com data e assinatura
    y += 10;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    doc.setFontSize(9);
    doc.text(`Documento gerado em: ${dataAtual}`, margin, y);
    
    const larguraAssinatura = 70;
    doc.line(pageWidth - margin - larguraAssinatura, y + 10, pageWidth - margin, y + 10);
    doc.text('Assinatura do Responsável', pageWidth - margin - larguraAssinatura/2, y + 15, { align: 'center' });
    
    // Adicionar número de página
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${i} de ${totalPaginas}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 10);
    }
    
    // Salvar o PDF
    doc.save('Coleta_de_Classe_ACDA.pdf');
}
