document.addEventListener('DOMContentLoaded', function() {
    const turnoSelect = document.getElementById('turno');
    const horarioAulaTable = document.getElementById('horarioAula');

    function populateTimeSelects(row) {
        const horaInicioSelect = row.querySelector('.horaInicio');
        const minutoInicioSelect = row.querySelector('.minutoInicio');
        const horaTerminoSelect = row.querySelector('.horaTermino');
        const minutoTerminoSelect = row.querySelector('.minutoTermino');

        if (horaInicioSelect && minutoInicioSelect && horaTerminoSelect && minutoTerminoSelect) {
            horaInicioSelect.innerHTML = '<option value="">Selecione</option>';
            horaTerminoSelect.innerHTML = '<option value="">Selecione</option>';
            minutoInicioSelect.innerHTML = '<option value="">Selecione</option>';
            minutoTerminoSelect.innerHTML = '<option value="">Selecione</option>';

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
                return; // Se nenhum turno selecionado, não preencher as opções
            }

            for (let i = startHour; i < endHour; i++) {
                const formattedHour = String(i).padStart(2, '0');
                horaInicioSelect.innerHTML += `<option value="${formattedHour}">${formattedHour}</option>`;
                horaTerminoSelect.innerHTML += `<option value="${formattedHour}">${formattedHour}</option>`;
            }

            for (let i = 0; i < 60; i++) {
                const formattedMinute = String(i).padStart(2, '0');
                minutoInicioSelect.innerHTML += `<option value="${formattedMinute}">${formattedMinute}</option>`;
                minutoTerminoSelect.innerHTML += `<option value="${formattedMinute}">${formattedMinute}</option>`;
            }
        }
    }

    turnoSelect.addEventListener('change', function() {
        const rows = horarioAulaTable.querySelectorAll('tbody tr');
        rows.forEach(populateTimeSelects);
    });

    const rows = horarioAulaTable.querySelectorAll('tbody tr');
    rows.forEach(populateTimeSelects);
});

function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);
    const rowHeight = 10;
    const headerColor = '#04456D'; // Azul claro
    let y = margin;

    // Função auxiliar para criar cabeçalhos azuis
    function criarCabecalho(texto, posY) {
        doc.setFillColor(headerColor);
        doc.rect(margin, posY, contentWidth, rowHeight, 'F');
        doc.setTextColor(255, 255, 255); // Texto branco
        doc.setFontSize(12);
        doc.text(texto, pageWidth / 2, posY + rowHeight - 2, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Volta para texto preto
        return posY + rowHeight;
    }

    // Função auxiliar para criar campos de formulário
    function criarCampo(texto, valor, posY, fullWidth = false, secondField = null, secondValue = null) {
        const fieldWidth = fullWidth ? contentWidth : contentWidth / 2 - 2;
        
        // Primeiro campo
        doc.setFontSize(10);
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, posY, fieldWidth, rowHeight, 'F');
        doc.setFontSize(10);
        doc.text(texto, margin + 2, posY + rowHeight - 2);
        
        // Valor do primeiro campo
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, posY + rowHeight, fieldWidth, rowHeight, 'F');
        doc.text(valor || '', margin + 2, posY + rowHeight * 2 - 2);
        
        // Se houver segundo campo
        if (!fullWidth && secondField) {
            const secondX = margin + fieldWidth + 4;
            
            // Segundo campo
            doc.setFillColor(230, 230, 230);
            doc.rect(secondX, posY, fieldWidth, rowHeight, 'F');
            doc.text(secondField, secondX + 2, posY + rowHeight - 2);
            
            // Valor do segundo campo
            doc.setFillColor(255, 255, 255);
            doc.rect(secondX, posY + rowHeight, fieldWidth, rowHeight, 'F');
            doc.text(secondValue || '', secondX + 2, posY + rowHeight * 2 - 2);
        }
        
        return posY + rowHeight * 2;
    }

    // Título
    y = criarCabecalho('COLETA DE CLASSE - ATIVIDADES CURRICULARES DESPORTIVAS E ARTÍSTICAS (ACDA)', y);
    
    // 1. Tipo de Ensino
    y = criarCampo('1. Tipo de Ensino', document.getElementById('tipoEnsino').value, y, true);
    
    // 2. Série e 3. Turma (lado a lado)
    y = criarCampo('2. Série', document.getElementById('serie').value, y, false, 
                   '3. Turma', document.getElementById('turma').value);
    
    // 4. Turno
    y = criarCampo('4. Turno', document.getElementById('turno').value, y, true);
    
    // 5. Horário da Aula
    y = criarCabecalho('5. Horário da Aula', y);
    
    // Tabela de horários
    const colunas = ['Aula', 'Dias', 'Horário Início', 'Horário Término'];
    const colWidths = [contentWidth * 0.1, contentWidth * 0.3, contentWidth * 0.3, contentWidth * 0.3];
    
    // Cabeçalho da tabela
    let currentX = margin;
    doc.setFillColor(240, 240, 240);
    for (let i = 0; i < colunas.length; i++) {
        doc.rect(currentX, y, colWidths[i], rowHeight, 'F');
        doc.text(colunas[i], currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
        currentX += colWidths[i];
    }
    y += rowHeight;
    
    // Linhas da tabela
    const rows = document.querySelectorAll('#horarioAula tbody tr');
    rows.forEach((row, index) => {
        currentX = margin;
        const dia = row.querySelector('.diaSemana').value || '';
        const horaInicio = row.querySelector('.horaInicio').value || '';
        const minutoInicio = row.querySelector('.minutoInicio').value || '';
        const horaTermino = row.querySelector('.horaTermino').value || '';
        const minutoTermino = row.querySelector('.minutoTermino').value || '';
        
        const horarioInicio = `${horaInicio}:${minutoInicio}`;
        const horarioTermino = `${horaTermino}:${minutoTermino}`;
        
        const rowData = [`${index + 1}ª`, dia, horarioInicio, horarioTermino];
        
        for (let i = 0; i < rowData.length; i++) {
            doc.rect(currentX, y, colWidths[i], rowHeight);
            doc.text(rowData[i], currentX + colWidths[i]/2, y + rowHeight - 2, { align: 'center' });
            currentX += colWidths[i];
        }
        y += rowHeight;
    });
    y += 5; // Espaço adicional após a tabela
    
    // 6. Tipo de Classe
    y = criarCampo('6. Tipo de Classe', document.getElementById('tipoClasse').value, y, true);
    
    // 7. Data Início
    let dataInicio = document.getElementById('dataInicio').value;
    // Converter de YYYY-MM-DD para DD/MM/YYYY se houver uma data
    if (dataInicio) {
        const partes = dataInicio.split('-');
        if (partes.length === 3) {
            dataInicio = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }
    y = criarCampo('7. Data Início', dataInicio, y, true);
    
    // 8. Categoria
    y = criarCabecalho('8. Categoria', y);
    
    // Obter valores selecionados das categorias
    const categorias = document.querySelectorAll('input[name="categoria"]:checked');
    const categoriasValues = Array.from(categorias).map(el => el.value).join(', ');
    y = criarCampo('Categoria Selecionada', categoriasValues, y, true);
    
    // 9. Modalidade
    y = criarCabecalho('9. Modalidade', y);
    const modalidadeValue = document.getElementById('modalidade').value || '';
    y = criarCampo('Modalidade Selecionada', modalidadeValue, y, true);
    
    // 10. Gênero
    y = criarCabecalho('10. Gênero', y);
    const generoValue = document.getElementById('genero').value || '';
    y = criarCampo('Gênero Selecionado', generoValue, y, true);
    
    // 11. Número da Sala
    y = criarCampo('11. Número da Sala', document.getElementById('numeroSala').value, y, true);
    
    // Observações
    if (y + rowHeight * 4 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        y = margin;
    }
    
    y = criarCabecalho('Observações', y);
    
    // Texto de observações
    const observacoes = document.getElementById('observacoes').value || 'Nenhuma observação';
    doc.setFontSize(10);
    
    // Adicionar observações com quebra de linha
    const textLines = doc.splitTextToSize(observacoes, contentWidth - 4);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, rowHeight * textLines.length, 'F');
    
    for (let i = 0; i < textLines.length; i++) {
        doc.text(textLines[i], margin + 2, y + (i + 1) * 5);
    }
    
    // Data e assinatura no final
    y += rowHeight * (textLines.length + 2);
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data: ${dataAtual}`, margin, y);
    
    y += rowHeight * 2;
    doc.line(margin, y, margin + 80, y); // Linha para assinatura
    doc.text('Assinatura do responsável', margin, y + 5);
    
    // Salvar o PDF
    doc.save('Coleta_de_Classe_ACDA.pdf');
}