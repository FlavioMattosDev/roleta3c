document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheel');
    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spin');
    const addChoicesButton = document.getElementById('add-choices');
    const choicesInput = document.getElementById('choices-input');
    const arrow = document.querySelector('.arrow');
    const modal = document.getElementById('resultModal');
    const modalResult = document.getElementById('modalResult');
    const closeModal = document.querySelector('.close');
    const btnExcluir = document.getElementById('btn-excluir');
    const editButton = document.getElementById('edit');
    const editModal = document.getElementById('editModal');
    const closeEditModal = document.querySelector('.close-edit');
    const participantsList = document.getElementById('participantsList');

    editButton.addEventListener('click', openEditModal);
    closeEditModal.addEventListener('click', () => editModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.style.display = 'none';
    });

    let choices = [];
    let angle = 0;
    let spinning = false;
    let selectedChoice = ''; // Variável global para armazenar a escolha selecionada

    function drawWheel() {
        const sections = choices.length;
        if (sections === 0) return;
        const anglePerSection = 2 * Math.PI / sections;
        const colors = ['#e74c3c', '#f39c12', '#27ae60', '#8e44ad', '#3498db', '#f1c40f', '#16a085'];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        choices.forEach((choice, i) => {
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, anglePerSection * i, anglePerSection * (i + 1));
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(anglePerSection * (i + 0.5));
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(truncateText(choice, 10), canvas.width / 2 - 10, 0); // Ajuste o comprimento máximo conforme necessário
            ctx.restore();
        });
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '…';
    }

    function rotateWheel() {
        if (spinning || choices.length === 0) return;
        spinning = true;

        const spinTime = 3000; // Duração do giro
        const spinSpeed = 10; // Velocidade do giro
        let start = Date.now();

        const spinInterval = setInterval(() => {
            let timeElapsed = Date.now() - start;
            let progress = Math.min(timeElapsed / spinTime, 1);
            angle += spinSpeed * (1 - progress) * 10;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle * Math.PI / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            drawWheel();
            ctx.restore();

            if (progress < 1) {
                requestAnimationFrame(() => {
                    spinInterval(); // Continuar girando
                });
            } else {
                clearInterval(spinInterval);

                // Cálculo do resultado baseado na posição da seta
                const arrowRect = arrow.getBoundingClientRect();
                const canvasRect = canvas.getBoundingClientRect();

                const arrowCenterX = arrowRect.left + arrowRect.width / 2;
                const arrowCenterY = arrowRect.top + arrowRect.height / 2;
                const canvasCenterX = canvasRect.left + canvasRect.width / 2;
                const canvasCenterY = canvasRect.top + canvasRect.height / 2;

                const deltaX = arrowCenterX - canvasCenterX;
                const deltaY = arrowCenterY - canvasCenterY;
                const arrowAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                const normalizedArrowAngle = (arrowAngle + 360) % 360;

                const finalAngle = (angle + 360 - normalizedArrowAngle) % 360;
                const numSegments = choices.length;
                const anglePerSegment = 360 / numSegments;
                const segmentIndex = Math.floor((360 - finalAngle) / anglePerSegment) % numSegments;
                selectedChoice = choices[segmentIndex]; // Armazena a escolha selecionada

                // Truncar o texto se for muito longo
                const maxLength = 20; // Ajuste o comprimento máximo conforme necessário
                const truncatedSegment = truncateText(selectedChoice, maxLength);

                modalResult.innerHTML = `<h4>O resultado foi:</h4>
                <p>${truncatedSegment}</p>`;
                modal.style.display = 'flex'; // Exibir modal
                spinButton.disabled = false;
                spinning = false;
            }
        }, 10);
    }

    function removeChoice(choiceToRemove) {
        choices = choices.filter(choice => choice !== choiceToRemove);
        drawWheel(); // Atualiza a roleta
        modal.style.display = 'none'; // Fecha o modal
    }

function addChoices() {
    const inputText = choicesInput.value.trim();
    if (inputText !== '') {
        const newChoices = inputText.split(/[\n,]+/)
            .map(choice => choice.trim())
            .filter(choice => choice !== '');
        
        // Filtra novos valores não existentes
        const uniqueNewChoices = newChoices.filter(choice => 
            !choices.includes(choice)
        );
        
        choices = [...choices, ...uniqueNewChoices];
        choicesInput.value = '';
        drawWheel();
    } else {
        alert('Por favor, adicione algumas escolhas.');
    }
}

    addChoicesButton.addEventListener('click', addChoices);
    choicesInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            addChoices();
        }
    });
    spinButton.addEventListener('click', rotateWheel);

    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    btnExcluir.addEventListener('click', () => {
        if (selectedChoice) {
            removeChoice(selectedChoice);
            selectedChoice = ''; // Limpa a escolha selecionada após remoção
        }
    });

    function openEditModal() {
        editModal.style.display = 'flex';
        participantsList.innerHTML = '';
        
        // Ordena e exibe os participantes
        const sortedChoices = [...new Set(choices)].sort();
        
        sortedChoices.forEach(participant => {
            const li = document.createElement('li');
            li.className = 'participant-item';
            li.innerHTML = `
                <span>${participant}</span>
                <div class="edit-buttons">
                    <button class="edit-name-btn" data-name="${participant}">Editar</button>
                    <button class="remove-name-btn" data-name="${participant}">Remover</button>
                </div>
            `;
            participantsList.appendChild(li);
        });
    
        // Adiciona eventos aos botões
        document.querySelectorAll('.remove-name-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.dataset.name;
                choices = choices.filter(choice => choice !== name);
                drawWheel();
                openEditModal();
            });
        });
    
        document.querySelectorAll('.edit-name-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const oldName = e.target.dataset.name;
                const newName = prompt('Editar nome:', oldName);
                if (newName && newName.trim()) {
                    choices = choices.map(choice => 
                        choice === oldName ? newName.trim() : choice
                    );
                    drawWheel();
                    openEditModal();
                }
            });
        });
    }
});
